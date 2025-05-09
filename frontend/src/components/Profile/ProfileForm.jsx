import React from "react";

const ProfileForm = ({ formData, handleChange, handleSubmit }) => {
    return (
        <div className="wrapperForm">

            <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                className="form-control"
                                type="text"
                                name="nama_lengkap"
                                value={formData.nama_lengkap}
                                onChange={handleChange}
                                placeholder="John Smith"
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label>Email</label>
                            <input
                                className="form-control"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="user@example.com"
                            />
                        </div>
                    </div>
                </div>
            </form>
                <div className="row mt-3">
                    <div className="col-lg-12 d-flex flex-column mb-3">
                        <button className="btn btn-primary " type="submit" onClick={handleSubmit}>
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
        </div>
    );
};

export default ProfileForm;
