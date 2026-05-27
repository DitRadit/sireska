import api from "../api/axios";

const pesananService = {
    // Mengambil semua reservasi milik user yang login
    getMyReservasi: async () => {
        const res = await api.get("/reservasi/my"); 
        return res.data;
    }
};

export default pesananService;