import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

function withRouter(Component) {
    return (props) => {
        let navigate = useNavigate();
        let location = useLocation();
        let params = useParams();
        return <Component {...props} navigate={navigate} location={location} params={params} />;
    }
}

export default withRouter;