const { Amplify } = require("aws-amplify");
const { signIn, fetchAuthSession } = require("aws-amplify/auth");
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_BP7F0pciF",
      userPoolClientId: "2lu594navfchltkopqlmk8luc7",
    },
  },
});

async function get_signin_info(username, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });

    if (isSignedIn) {
      const session = await fetchAuthSession();

      // Extract tokens and sub
      const idToken = session.tokens?.idToken;
      const accessToken = session.tokens?.accessToken;
      const sub = idToken?.payload?.sub;

      // Manually construct the CognitoUser-style object structure
      return {
        Session: null,
        username: sub, // Usually the UUID/Sub in the actual object
        attributes: {
          sub: sub,
          email_verified: true,
          email: username,
        },
        authenticationFlowType: "USER_SRP_AUTH",
        pool: {
          userPoolId: "us-east-1_BP7F0pciF",
          clientId: "2lu594navfchltkopqlmk8luc7",
        },
        signInUserSession: {
          idToken: {
            jwtToken: idToken?.toString(),
            payload: idToken?.payload,
          },
          accessToken: {
            jwtToken: accessToken?.toString(),
            payload: accessToken?.payload,
          },
          clockDrift: 0,
        },
        header: sub ? sub.slice(0, 8) : null,
      };
    } else {
      console.warn("Next Step:", nextStep);
      return null;
    }
  } catch (error) {
    console.error("Auth Error:", error);
    return null;
  }
}

module.exports = get_signin_info;
