const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const roles = [
        { role_name: "admin", deskripsi: "Administrator" },
        { role_name: "user", deskripsi: "User biasa" }
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { role_name: role.role_name },
            update: {},
            create: role
        });
    }

    console.log("Seed role berhasil");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });