"""
User controller for user-related operations
"""
from flask import render_template, request, redirect, url_for, flash
from services.user_service import UserService

class UserController:
    """Controller for user operations"""
    
    @staticmethod
    def register():
        """Show registration form"""
        return render_template('register.html')
    
    @staticmethod
    def register_user():
        """Process user registration"""
        name = request.form.get('name')
        email = request.form.get('email')
        employee_id = request.form.get('employee_id')
        image_data = request.form.get('image_data')
        
        if not image_data:
            flash('Vui lòng chụp ảnh khuôn mặt!', 'error')
            return redirect(url_for('user.register'))
        
        user, error = UserService.create_user(name, email, employee_id, image_data)
        
        if error:
            flash(error, 'error')
            return redirect(url_for('user.register'))
        
        flash('Đăng ký thành công!', 'success')
        return redirect(url_for('main.index'))
    
    @staticmethod
    def history():
        """Show all users for history selection"""
        users = UserService.get_all_users()
        return render_template('history.html', users=users)