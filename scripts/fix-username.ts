import prisma from '../src/lib/db';

async function fixUserName() {
    try {
        // Find and update the user with incorrect name
        const result = await prisma.user.updateMany({
            where: {
                name: {
                    contains: 'osama habdallah',
                    mode: 'insensitive',
                },
            },
            data: {
                name: 'Osamah Abdallah',
            },
        });

        console.log(`Updated ${result.count} user(s)`);

        // Also try exact match variations
        const result2 = await prisma.user.updateMany({
            where: {
                OR: [
                    { name: 'osama habdallah' },
                    { name: 'Osama Habdallah' },
                    { name: 'Osama habdallah' },
                ],
            },
            data: {
                name: 'Osamah Abdallah',
            },
        });

        console.log(`Updated ${result2.count} more user(s)`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error updating user:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

fixUserName();
