const loginRequestUser = {scopes: ["api://64108941-8476-4d57-8f86-a75ac1919844/User","offline_access"]};
const optionRefeshUser = {scopes: ["api://64108941-8476-4d57-8f86-a75ac1919844/User","offline_access"],forceRefresh: true}
const msalConfig = {
    auth: {
      clientId: "64108941-8476-4d57-8f86-a75ac1919844",
      authority: "https://login.microsoftonline.com/65ae636f-3f68-47d5-86da-672f582a27d7",
      redirectUri: "/",
      postLogoutRedirectUri: "/"
    }
  };

export {loginRequestUser,optionRefeshUser,msalConfig}