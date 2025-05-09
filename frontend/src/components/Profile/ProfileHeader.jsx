import React from "react";

const ProfileHeader = ({ nama }) => {
    return (
        <div className="col d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
            <div className="text-center text-sm-left mb-2 mb-sm-0 ">
                <h4 className="pt-sm-2 pb-1 mb-0 text-wrap ">{nama}</h4>
            </div>
        </div>
    );
};

export default ProfileHeader;
