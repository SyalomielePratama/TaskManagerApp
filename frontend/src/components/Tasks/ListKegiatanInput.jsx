// components/task/ListKegiatanInput.jsx
import React from "react";

const ListKegiatanInput = ({ list, status, onChange, onRemove, onAdd, onToggleStatus }) => (
    <div className="mb-3">
        <label className="form-label me-3">List Kegiatan</label>
        {list.map((item, idx) => (
            <div className="input-group mb-2" key={idx}>
                <input
                    type="text"
                    className="form-control"
                    placeholder={`Kegiatan ${idx + 1}`}
                    value={item}
                    onChange={(e) => onChange(idx, e.target.value, "list_kegiatan")}
                />
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => onRemove(idx, "list_kegiatan")}
                >
                    <i className="bi bi-trash"></i>
                </button>
                <button
                    type="button"
                    className={`btn btn-sm btn-selesai ${status[idx] ? 'btn-success' : 'btn-outline-success'} ms-2`}
                    onClick={() => onToggleStatus(idx)}
                >
                    <i className={`bi ${status[idx] ? 'bi-check-circle' : 'bi-circle'} me-1`}></i>
                    {status[idx] ? 'Selesai' : 'Belum Selesai'}
                </button>
            </div>
        ))}
        <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => onAdd("list_kegiatan")}
        >
            <i className="bi bi-plus"></i> Tambah Kegiatan
        </button>
    </div>
);

export default ListKegiatanInput;
