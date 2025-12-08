const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.question.count();
    const withStarter = await prisma.question.count({
        where: {
            starterCode: {
                not: ''
            }
        }
    });

    console.log(`Total: ${total}`);
    console.log(`With Starter Code: ${withStarter}`);

    if (withStarter < total) {
        console.log("Some questions differ! Sample of missing:");
        const missing = await prisma.question.findFirst({
            where: { starterCode: '' }
        });
        console.log(missing ? `${missing.title} (${missing.id})` : "None found?");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
