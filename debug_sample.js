const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const q = await prisma.question.findFirst();
    console.log("--- TITLE ---");
    console.log(q.title);
    console.log("--- STARTER CODE ---");
    console.log(q.starterCode);
    console.log("--------------------");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
