// components/task/LinkPendukungInput.jsx
import React from "react";

const LinkPendukungInput = ({ links, onChange, onRemove, onAdd }) => (
    <div className="mb-4">
        <label className="form-label me-3">Link Pendukung</label>
        {links.map((link, idx) => (
            <div className="input-group mb-2" key={idx}>
                <input
                    type="text"
                    className="form-control"
                    placeholder={`Link ${idx + 1}`}
                    value={link}
                    onChange={(e) => onChange(idx, e.target.value, "link_pendukung")}
                />
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => onRemove(idx, "link_pendukung")}
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        ))}
        <button
            type="button"
            className="btn btn-outline-primary btn-sm "
            onClick={() => onAdd("link_pendukung")}
        >
            <i className="bi bi-plus"></i> Tambah Link
        </button>
    </div>
);

export default LinkPendukungInput;
