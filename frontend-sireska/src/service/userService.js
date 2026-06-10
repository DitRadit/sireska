// src/service/userManagementService.js

import api from "../api/axios";

const userManagementService = {
  async getAllUsers(params = {}) {
    const { data } = await api.get("/user-management", { params });
    return data;
  },

  async getUserById(id) {
    const { data } = await api.get(`/user-management/${id}`);
    return data;
  },

  async addUser(payload) {
    const { data } = await api.post("/user-management", payload);
    return data;
  },

  async editUser(id, payload) {
    const { data } = await api.put(`/user-management/${id}`, payload);
    return data;
  },

  async changeRole(id, role_id) {
    const { data } = await api.patch(
      `/user-management/${id}/role`,
      { role_id }
    );
    return data;
  },

  async toggleActiveStatus(id) {
    const { data } = await api.patch(
      `/user-management/${id}/toggle`
    );
    return data;
  },

  async deactivateUser(id) {
    const { data } = await api.patch(
      `/user-management/${id}/deactivate`
    );
    return data;
  },

  async getRoles() {
    const { data } = await api.get("/roles");
    return data;
  },
};

export default userManagementService;