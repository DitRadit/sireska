import api from "../api/axios";

const bookingService = {
    createBooking: async (data) => {
        const res = await api.post("/reservasi", data); 
        return res.data;
    },
    // Gunakan PATCH sesuai rute di reservasiRoutes.js
    cancelBooking: async (id) => {
        const res = await api.patch(`/reservasi/my/${id}/cancel`);
        return res.data;
    }
};

export default bookingService;