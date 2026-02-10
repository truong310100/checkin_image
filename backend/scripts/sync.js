const syncDataUser = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'Access Token không tồn tại' });
    }

    let allUserData = [];
    let url = "https://graph.microsoft.com/v1.0/users";

    // Lấy tất cả dữ liệu người dùng
    while (url) {
      const graphResponse = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userData = graphResponse.data;
      allUserData = [...allUserData, ...userData.value];
      url = userData['@odata.nextLink'] || null;
    }

    if (allUserData.length > 0) {
      console.log(`Tổng số người dùng cần xử lý: ${allUserData.length}`);
      
      // Xử lý dữ liệu
      allUserData.forEach(userData => {
        userData.id365 = userData.id;
        delete userData.id;
        userData.businessPhones = Array.isArray(userData.businessPhones)
          ? userData.businessPhones.join(', ')
          : userData.businessPhones;
      });

      // Lấy tất cả email trong một lần truy vấn
      const allEmails = allUserData.map(user => user.mail).filter(Boolean);
      const existingUsers = await User365.findAll({
        where: { mail: allEmails },
        attributes: ['id', 'mail', 'displayName', 'givenName', 'jobTitle', 'mobilePhone', 'officeLocation', 'preferredLanguage', 'surname', 'userPrincipalName', 'businessPhones']
      });

      // Tạo map để tra cứu nhanh
      const existingUsersMap = new Map();
      existingUsers.forEach(user => {
        existingUsersMap.set(user.mail, user);
      });

      const usersToCreate = [];
      const usersToUpdate = [];
      const fieldsToCheck = ['displayName', 'givenName', 'jobTitle', 'mobilePhone', 'officeLocation', 'preferredLanguage', 'surname', 'userPrincipalName', 'businessPhones'];

      // Phân loại users
      allUserData.forEach(userData => {
        const existingUser = existingUsersMap.get(userData.mail);
        
        if (existingUser) {
          // Kiểm tra thay đổi dữ liệu
          const isDataChanged = fieldsToCheck.some(key => {
            const newValue = userData[key] || null;
            const existingValue = existingUser[key] || null;
            return String(newValue) !== String(existingValue);
          });
          
          if (isDataChanged) {
            usersToUpdate.push({ 
              ...userData, 
              id: existingUser.id,
              mail: userData.mail
            });
          }
        } else {
          usersToCreate.push(userData);
        }
      });

      console.log(`Users to create: ${usersToCreate.length}, Users to update: ${usersToUpdate.length}`);

      // Cập nhật người dùng theo batch
      if (usersToUpdate.length > 0) {
        const BATCH_SIZE = 50; // Giới hạn batch size
        const updateBatches = [];
        
        for (let i = 0; i < usersToUpdate.length; i += BATCH_SIZE) {
          updateBatches.push(usersToUpdate.slice(i, i + BATCH_SIZE));
        }

        for (const batch of updateBatches) {
          const updatePromises = batch.map(user => 
            User365.update(
              {
                id365: user.id365,
                displayName: user.displayName,
                givenName: user.givenName,
                jobTitle: user.jobTitle,
                mobilePhone: user.mobilePhone,
                officeLocation: user.officeLocation,
                preferredLanguage: user.preferredLanguage,
                surname: user.surname,
                userPrincipalName: user.userPrincipalName,
                businessPhones: user.businessPhones
              },
              { 
                where: { mail: user.mail }
              }
            )
          );
          await Promise.all(updatePromises);
          console.log(`Processed batch of ${batch.length} updates`);
        }
        console.log(`Đã cập nhật ${usersToUpdate.length} người dùng`);
      }

      // Thêm mới người dùng theo batch
      if (usersToCreate.length > 0) {
        const BATCH_SIZE = 100;
        for (let i = 0; i < usersToCreate.length; i += BATCH_SIZE) {
          const batch = usersToCreate.slice(i, i + BATCH_SIZE);
          await User365.bulkCreate(batch);
          console.log(`Created batch of ${batch.length} users`);
        }
        console.log(`Đã tạo mới ${usersToCreate.length} người dùng`);
      }

      res.json({ 
        message: 'Đồng bộ xong.',
        created: usersToCreate.length,
        updated: usersToUpdate.length,
        total: allUserData.length
      });
    } else {
      res.status(404).json({ error: 'No user data found.' });
    }
  } catch (err) {
    console.error("Error synchronizing user data:", err);
    res.status(500).json({ error: 'Failed to synchronize data.' });
  }
}

const syncDataUser_Images = async (req, res) =>{
  try {
    const { accessToken, id } = req.body;

    // Tìm người dùng cần đồng bộ ảnh
    let usersWithoutPhoto = [];
    if (id && id.length > 0) {
      usersWithoutPhoto = await User365.findAll({
        where: { id }
      });
    } else {
      usersWithoutPhoto = await User365.findAll({
        where: { photo: null }
      });
    }

    console.log(`Số người dùng cần đồng bộ ảnh: ${usersWithoutPhoto.length}`);

    // Nếu không có người dùng cần đồng bộ ảnh
    if (usersWithoutPhoto.length === 0) {
      return res.json({ message: 'Không có người dùng cần đồng bộ ảnh.' });
    }

    // Đồng bộ ảnh người dùng
    const updatePhotoPromises = usersWithoutPhoto.map(async (user) => {
      try {
        const photoResponse = await axios.get(
          `https://graph.microsoft.com/v1.0/users/${user.mail}/photo/$value`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: 'arraybuffer'
          }
        );

        // Chuyển đổi ảnh thành base64
        const photoBuffer = Buffer.from(photoResponse.data, 'binary');
        const photoBase64 = photoBuffer.toString('base64');

        // Cập nhật ảnh trong cơ sở dữ liệu
        await User365.update({ photo: photoBase64 }, { where: { mail: user.mail } });
        console.log(`Ảnh của người dùng ${user.mail} đã được cập nhật thành công.`);
        return { mail: user.mail, success: true };
      } catch (err) {
        console.error(`Không thể lấy ảnh cho người dùng ${user.mail}:`, err.message || err);
        return { mail: user.mail, success: false, error: err.message || 'Không thể lấy ảnh.' };
      }
    });

    // Chờ tất cả các tác vụ đồng bộ ảnh hoàn thành
    const updateResults = await Promise.all(updatePhotoPromises);

    // Log kết quả tổng hợp
    const successfulUpdates = updateResults.filter((result) => result.success).length;
    const failedUpdates = updateResults.filter((result) => !result.success).length;

    console.log(`Đã cập nhật ảnh cho ${successfulUpdates} người dùng.`);
    console.log(`Không thể cập nhật ảnh cho ${failedUpdates} người dùng.`);

    res.json({
      message: 'Quá trình đồng bộ ảnh hoàn tất.',
      successfulUpdates,
      failedUpdates,
      details: updateResults
    });
  } catch (err) {
    console.error('Lỗi khi đồng bộ ảnh:', err.message || err);
    res.status(500).json({ error: 'Không thể đồng bộ ảnh cho người dùng.' });
  }
};