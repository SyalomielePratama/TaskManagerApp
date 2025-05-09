import React from "react";

const ProfilePicture = ({ fotoPreview, handleFileChange }) => {
    return (
        <div className="mx-auto position-relative" style={{ width: "140px", height: "140px" }}>
            <div
                className="rounded overflow-hidden position-relative"
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgb(233, 236, 239)",
                }}
            >
                {fotoPreview ? (
                    <img
                        src={fotoPreview}
                        alt="Foto Profil"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <span
                        className="d-flex justify-content-center align-items-center w-100 h-100"
                        style={{ color: "rgb(166, 168, 170)", font: "bold 8pt Arial" }}
                    >
                        140x140
                    </span>
                )}
                <label
                    className="overlay-foto d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        color: "#fff",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        cursor: "pointer",
                    }}
                >
                    <i className="fa fa-camera me-2"></i> Ganti Foto
                    <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>
            </div>
        </div>
    );
};

export default ProfilePicture;
