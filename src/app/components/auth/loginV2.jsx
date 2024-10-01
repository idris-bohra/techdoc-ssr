import React, { useEffect } from "react";
import "./auth.scss";
import "./login.scss";
import { ReactComponent as TECHDOC } from "../../assets/icons/TECHDOC100.svg";
import { ReactComponent as TECHDOCC } from "../../assets/icons/TECHDOC.svg";
import { getCurrentOrg, getCurrentUser, getOrgList } from "./authServiceV2";
import { useNavigate } from "react-router-dom";

const LoginV2 = () => {
  const navigate = useNavigate();

  const proxyGooglereferenceMapping = {
    local: import.meta.env.VITE_PROXY_REFERENCE_ID_LOCAL,
    test: import.meta.env.VITE_PROXY_REFERENCE_ID_TEST,
    prod: import.meta.env.VITE_PROXY_REFERENCE_ID_PROD,
  };

  useEffect(() => {
    let script;

    const checkIfUserAlreadyLogin = () => {
      if (getCurrentUser() && getOrgList() && getCurrentOrg()) {
        navigate(`/orgs/${getCurrentOrg().id}/dashboard`);
      } else {
        loadScript();
      }
    };

    const loadScript = () => {
      const configuration = {
        referenceId:
          proxyGooglereferenceMapping[import.meta.env.VITE_ENV] || "",
        success: (data) => {
          console.log("response", data);
        },
        failure: (error) => {
          console.error("failure reason", error);
        },
      };
      script = document.createElement("script");
      script.src =
        "https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js?time=34093049";
      script.async = true;
      script.onload = () => {
        if (window.initVerification) {
          window.initVerification(configuration);
        }
      };
      document.body.appendChild(script);
    };

    checkIfUserAlreadyLogin();

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [navigate, proxyGooglereferenceMapping]);

  const env = import.meta.env.VITE_ENV || "";
  const divId = proxyGooglereferenceMapping[env];

  return (
    <div className="login d-flex gap-sm-0 gap-4 flex-column-reverse flex-sm-row p-2 p-sm-0">
      <div className="login__details deatil-sec col-xl-3 col-lg-4 col-md-5 col-sm-6 p-2 p-sm-4 p-xl-5">
        <TECHDOC className="d-none d-sm-block" />
        <h4 className="mt-4">
          Your company’s technical knowledge deserves a beautiful home
        </h4>
        <ul className="feature-list mt-3">
          <li>Create-Collaborate-Review-Secure-Publish-Maintain</li>
          <li>Create a source of truth</li>
          <li>Your content, your way</li>
          <li>Create/Manage Environment</li>
          <li>Create/Share internal API documentation</li>
          <li>Scalability and Performance</li>
        </ul>
      </div>

      <div className="login__main col-sm-6 col-md-7 col-lg-8 col-xl-9 p-0 mb-3 p-sm-4 p-xl-5">
        <div className="login__main__loginbtn pt-sm-0">
          <TECHDOCC className="d-flex justify-content-center d-sm-none w-100 mb-2" />
          <h2 className="d-none d-sm-block t-dark">Welcome Back!</h2>
          <div id={divId}></div>
        </div>
      </div>
    </div>
  );
};

export default LoginV2;
