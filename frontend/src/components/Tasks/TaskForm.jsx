// components/task/TaskForm.jsx
import React from "react";
import ListKegiatanInput from "./ListKegiatanInput";
import LinkPendukungInput from "./LinkPendukungInput";

const TaskForm = ({ formData, handleChange, handleListChange, removeListItem, addListItem, handleStatusToggle, handleSubmit }) => (
    <form onSubmit={handleSubmit}>
        <div className="row mb-3">
            <div className="col-md-6">
                <label className="form-label">Nama Tugas</label>
                <input
                    type="text"
                    className="form-control"
                    name="nama_tugas"
                    value={formData.nama_tugas}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-md-6">
                <label className="form-label">Prioritas</label>
                <select
                    className="form-select"
                    name="prioritas"
                    value={formData.prioritas}
                    onChange={handleChange}
                >
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                </select>
            </div>
        </div>

        <div className="mb-3">
            <label className="form-label">Deskripsi</label>
            <textarea
                className="form-control"
                rows="3"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
            ></textarea>
        </div>

        <div className="mb-3">
            <label className="form-label">Tenggat Waktu</label>
            <input
                type="datetime-local"
                className="form-control"
                name="tenggat_waktu"
                value={formData.tenggat_waktu}
                onChange={handleChange}
                required
            />
        </div>

        <ListKegiatanInput
            list={formData.list_kegiatan}
            status={formData.list_kegiatan_status}
            onChange={handleListChange}
            onRemove={removeListItem}
            onAdd={addListItem}
            onToggleStatus={handleStatusToggle}
        />

        <LinkPendukungInput
            links={formData.link_pendukung}
            onChange={handleListChange}
            onRemove={removeListItem}
            onAdd={addListItem}
        />

        <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success">Simpan Perubahan</button>
        </div>
    </form>
);

export default TaskForm;
