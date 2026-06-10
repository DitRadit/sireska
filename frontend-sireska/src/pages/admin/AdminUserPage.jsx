import { useEffect, useState, useCallback } from "react";
import SidebarComponent from "../../components/sidebarComponent";
import userManagementService from "../../service/userService";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ROLE_COLORS = {
  1: { bg: "bg-purple-50",  text: "text-purple-600",  border: "border-purple-200" },
  2: { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200" },
  3: { bg: "bg-green-50",   text: "text-green-600",   border: "border-green-200" },
  4: { bg: "bg-yellow-50",  text: "text-yellow-600",  border: "border-yellow-200" },
};

const getRoleColor = (roleId) =>
  ROLE_COLORS[roleId] || { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" };

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, ok, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg border text-sm font-bold animate-slide-up
      ${ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}
  >
    <span className="material-symbols-outlined text-[18px]">{ok ? "check_circle" : "error"}</span>
    {msg}
    <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
      <span className="material-symbols-outlined text-[16px]">close</span>
    </button>
  </div>
);

// ─── Modal Tambah / Edit User ──────────────────────────────────────────────────
const UserFormModal = ({ mode, user, roles, onClose, onSuccess, showToast }) => {
  const isEdit = mode === "edit";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: user?.nama_lengkap || "",
    email:        user?.email || "",
    nim_nip:      user?.nim_nip || "",
    no_hp:        user?.no_hp || "",
    role_id:      user?.role?.role_id || "",
    password:     "",
    is_verified:  user?.is_verified ?? false,
    is_active:    user?.is_active ?? true,
  });

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.email || !form.role_id) {
      showToast("Nama lengkap, email, dan role wajib diisi.", false);
      return;
    }
    if (!isEdit && !form.password) {
      showToast("Password wajib diisi untuk user baru.", false);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nama_lengkap: form.nama_lengkap,
        email:        form.email,
        nim_nip:      form.nim_nip || undefined,
        no_hp:        form.no_hp || undefined,
        role_id:      parseInt(form.role_id),
        is_verified:  form.is_verified,
        is_active:    form.is_active,
        ...(form.password && { password: form.password }),
      };
      if (isEdit) {
        await userManagementService.editUser(user.user_id, payload);
        showToast("Data user berhasil diperbarui.");
      } else {
        await userManagementService.addUser(payload);
        showToast("User baru berhasil ditambahkan.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err?.response?.data?.message || "Terjadi kesalahan.", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg mx-4 animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500 text-[18px]">
                {isEdit ? "edit" : "person_add"}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Edit User" : "Tambah User Baru"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400 text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Nama & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nama_lengkap}
                onChange={set("nama_lengkap")}
                placeholder="Nama lengkap"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="email@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* NIM/NIP & No HP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                NIM / NIP
              </label>
              <input
                type="text"
                value={form.nim_nip}
                onChange={set("nim_nip")}
                placeholder="Opsional"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                No. HP
              </label>
              <input
                type="text"
                value={form.no_hp}
                onChange={set("no_hp")}
                placeholder="Opsional"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              value={form.role_id}
              onChange={set("role_id")}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
            >
              <option value="">Pilih role...</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.role_name}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Password {isEdit && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
              {!isEdit && <span className="text-red-400"> *</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder={isEdit ? "Isi untuk ganti password" : "Password"}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
            />
          </div>

          {/* Toggle flags */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            {[
              { key: "is_verified", label: "Akun Terverifikasi" },
              { key: "is_active",   label: "Akun Aktif" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-orange-300 transition-colors"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={set(key)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${form[key] ? "bg-orange-500" : "bg-gray-300"}`}
                  />
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah User"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Ganti Role ──────────────────────────────────────────────────────────
const ChangeRoleModal = ({ user, roles, onClose, onSuccess, showToast }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role?.role_id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      await userManagementService.changeRole(user.user_id, parseInt(selectedRole));
      showToast(`Role berhasil diubah.`);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err?.response?.data?.message || "Terjadi kesalahan.", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm mx-4 animate-fade-in">
        <div className="px-6 py-5">
          <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-purple-500 text-[20px]">manage_accounts</span>
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Ganti Role</h3>
          <p className="text-xs text-gray-400 font-medium mb-5">
            Mengubah role untuk{" "}
            <span className="text-gray-700 font-bold">{user?.nama_lengkap}</span>
          </p>

          <div className="space-y-2 mb-5">
            {roles.map((r) => {
              const clr = getRoleColor(r.role_id);
              const isSelected = parseInt(selectedRole) === r.role_id;
              return (
                <button
                  key={r.role_id}
                  onClick={() => setSelectedRole(r.role_id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-orange-400 bg-orange-50 ring-2 ring-orange-200"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${clr.bg} ${clr.text} ${clr.border}`}
                  >
                    {r.role_name}
                  </span>
                  {r.deskripsi && (
                    <span className="text-xs text-gray-400 font-medium">{r.deskripsi}</span>
                  )}
                  {isSelected && (
                    <span className="material-symbols-outlined text-orange-500 text-[18px] ml-auto">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || parseInt(selectedRole) === user?.role?.role_id}
              className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-bold hover:bg-purple-600 transition-colors disabled:opacity-40"
            >
              {loading ? "Menyimpan..." : "Simpan Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Konfirmasi Nonaktifkan ──────────────────────────────────────────────
const ToggleActiveModal = ({ user, onClose, onSuccess, showToast }) => {
  const willDeactivate = user?.is_active;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await userManagementService.toggleActiveStatus(user.user_id);
      showToast(
        willDeactivate ? "Akun berhasil dinonaktifkan." : "Akun berhasil diaktifkan."
      );
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err?.response?.data?.message || "Terjadi kesalahan.", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 w-full max-w-sm mx-4 animate-fade-in">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            willDeactivate ? "bg-red-50" : "bg-green-50"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${
              willDeactivate ? "text-red-500" : "text-green-500"
            }`}
          >
            {willDeactivate ? "block" : "check_circle"}
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">
          {willDeactivate ? "Nonaktifkan Akun?" : "Aktifkan Akun?"}
        </h3>
        <p className="text-xs text-gray-400 font-medium mb-6">
          {willDeactivate ? (
            <>
              Akun <span className="text-gray-700 font-bold">{user?.nama_lengkap}</span> akan
              dinonaktifkan. User tidak akan bisa login atau mengakses apapun.
            </>
          ) : (
            <>
              Akun <span className="text-gray-700 font-bold">{user?.nama_lengkap}</span> akan
              diaktifkan kembali.
            </>
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-50 ${
              willDeactivate
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading
              ? "Memproses..."
              : willDeactivate
              ? "Ya, Nonaktifkan"
              : "Ya, Aktifkan"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Row Accordion ─────────────────────────────────────────────────────────────
const UserRow = ({ item, roles, onRefresh, showToast }) => {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null); // "edit" | "role" | "toggle"

  const roleClr = getRoleColor(item.role?.role_id);

  return (
    <>
      {/* ROW UTAMA */}
      <tr
        className={`border-b border-gray-100 transition-colors cursor-pointer ${
          open ? "bg-orange-50/40" : "hover:bg-gray-50/60"
        }`}
        onClick={() => setOpen((p) => !p)}
      >
        {/* Avatar + Nama */}
        <td className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {item.nama_lengkap?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">{item.nama_lengkap}</p>
              <p className="text-xs text-gray-400 font-medium">{item.nim_nip || "—"}</p>
            </div>
          </div>
        </td>

        {/* Email */}
        <td className="py-4 px-5 text-sm text-gray-500 font-medium">{item.email}</td>

        {/* Role */}
        <td className="py-4 px-5">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${roleClr.bg} ${roleClr.text} ${roleClr.border}`}
          >
            {item.role?.role_name || "-"}
          </span>
        </td>

        {/* Status Aktif */}
        <td className="py-4 px-5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              item.is_active
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.is_active ? "bg-green-500" : "bg-red-400"
              }`}
            />
            {item.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </td>

        {/* Chevron */}
        <td className="py-4 px-5 text-right">
          <span className="material-symbols-outlined text-gray-400 text-[20px]">
            {open ? "expand_less" : "expand_more"}
          </span>
        </td>
      </tr>

      {/* ROW DETAIL */}
      {open && (
        <tr className="border-b border-gray-100 bg-white">
          <td colSpan="5" className="px-5 py-5">
            {/* Grid info */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">No. HP</p>
                <p className="text-sm font-semibold text-gray-700">{item.no_hp || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Terdaftar</p>
                <p className="text-sm font-semibold text-gray-700">{formatTanggal(item.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Login Terakhir</p>
                <p className="text-sm font-semibold text-gray-700">{formatTanggal(item.last_login)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Verifikasi Akun</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.is_verified
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {item.is_verified ? "verified" : "pending"}
                  </span>
                  {item.is_verified ? "Terverifikasi" : "Belum Diverifikasi"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Status Akun</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.is_active
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.is_active ? "bg-green-500" : "bg-red-400"
                    }`}
                  />
                  {item.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Diperbarui</p>
                <p className="text-sm font-semibold text-gray-700">{formatTanggal(item.updated_at)}</p>
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center justify-end gap-2.5 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Edit */}
              <button
                onClick={() => setModal("edit")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                Edit
              </button>

              {/* Ganti Role */}
              <button
                onClick={() => setModal("role")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">manage_accounts</span>
                Ganti Role
              </button>

              {/* Toggle Aktif */}
              <button
                onClick={() => setModal("toggle")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  item.is_active
                    ? "border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                    : "border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {item.is_active ? "block" : "check_circle"}
                </span>
                {item.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* Modals */}
      {modal === "edit" && (
        <UserFormModal
          mode="edit"
          user={item}
          roles={roles}
          onClose={() => setModal(null)}
          onSuccess={onRefresh}
          showToast={showToast}
        />
      )}
      {modal === "role" && (
        <ChangeRoleModal
          user={item}
          roles={roles}
          onClose={() => setModal(null)}
          onSuccess={onRefresh}
          showToast={showToast}
        />
      )}
      {modal === "toggle" && (
        <ToggleActiveModal
          user={item}
          onClose={() => setModal(null)}
          onSuccess={onRefresh}
          showToast={showToast}
        />
      )}
    </>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
const AdminUserManagementPage = () => {
  const [users, setUsers]               = useState([]);
  const [roles] = useState([
  { role_id: 1, role_name: "admin" },
  { role_id: 2, role_name: "user" },
  { role_id: 3, role_name: "guest" },
]);
  const [loading, setLoading]           = useState(true);
  const [filterRole, setFilterRole]     = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalData, setTotalData]       = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast]               = useState(null);

  const LIMIT = 10;

  const showToast = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userManagementService.getAllUsers({
        page,
        limit: LIMIT,
        search: search || undefined,
        role_id: filterRole || undefined,
        is_active: filterActive !== "" ? filterActive : undefined,
      });
      setUsers(res.data || []);
      setTotalPages(res.pagination?.total_pages || 1);
      setTotalData(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data user.", false);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRole, filterActive, showToast]);

  useEffect(() => {
    setPage(1);
  }, [search, filterRole, filterActive]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Summary counts dari data yang ada
  const counts = {
    total:    totalData,
    aktif:    users.filter((u) => u.is_active).length,
    nonaktif: users.filter((u) => !u.is_active).length,
    unverif:  users.filter((u) => !u.is_verified).length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fade-in { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
        @keyframes slide-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fade-in .18s ease; }
        .animate-slide-up { animation: slide-up .22s ease; }
      `}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      {/* Global Toast */}
      {toast && (
        <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />
      )}

      <div className="bg-[#f7f5f4] min-h-screen flex">
        <SidebarComponent />

        <div className="flex-1 lg:ml-[260px] w-full overflow-x-hidden flex flex-col">

          {/* HEADER */}
          <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
            <p className="text-gray-500 mt-0.5 text-sm font-medium">
              Kelola akun, role, dan status pengguna sistem
            </p>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total User",       value: counts.total,    icon: "group",        color: "lime" },
                { label: "Akun Aktif",        value: counts.aktif,    icon: "check_circle", color: "green" },
                { label: "Akun Nonaktif",     value: counts.nonaktif, icon: "block",        color: "red" },
                { label: "Belum Verifikasi",  value: counts.unverif,  icon: "pending",      color: "yellow" },
              ].map(({ label, value, icon, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className={`h-1.5 w-full bg-${color}-500`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                      <div className={`bg-${color}-50 w-9 h-9 rounded-xl flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-${color}-500 text-[18px]`}>
                          {icon}
                        </span>
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FILTER + SEARCH BAR */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, email, atau NIM/NIP..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>

              {/* Filter Role */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-orange-400 transition-all text-gray-600 min-w-[140px]"
              >
                <option value="">Semua Role</option>
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </option>
                ))}
              </select>

              {/* Filter Status */}
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-orange-400 transition-all text-gray-600 min-w-[140px]"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>

              {/* Tombol Tambah */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm ml-auto"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Tambah User
              </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800">
                  Daftar User
                  {totalData > 0 && (
                    <span className="ml-2 text-xs font-semibold text-gray-400">
                      ({totalData} total)
                    </span>
                  )}
                </h2>
                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Nama User
                      </th>
                      <th className="text-left py-3 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-3 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left py-3 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-5" />
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-16">
                          <span className="material-symbols-outlined animate-spin text-orange-400 text-3xl block mx-auto mb-2">
                            autorenew
                          </span>
                          <p className="text-sm text-gray-400 font-medium">Memuat data...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-16">
                          <span className="material-symbols-outlined text-gray-200 text-4xl block mx-auto mb-2">
                            person_off
                          </span>
                          <p className="text-sm text-gray-400 font-medium">Tidak ada user ditemukan.</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((item) => (
                        <UserRow
                          key={item.user_id}
                          item={item}
                          roles={roles}
                          onRefresh={fetchUsers}
                          showToast={showToast}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-medium">
                    Halaman {page} dari {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p =
                        totalPages <= 5
                          ? i + 1
                          : page <= 3
                          ? i + 1
                          : page >= totalPages - 2
                          ? totalPages - 4 + i
                          : page - 2 + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                            page === p
                              ? "bg-orange-500 text-white"
                              : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah User */}
      {showAddModal && (
        <UserFormModal
          mode="add"
          user={null}
          roles={roles}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchUsers}
          showToast={showToast}
        />
      )}
    </>
  );
};

export default AdminUserManagementPage;