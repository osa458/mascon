import prisma from '../src/lib/db';

async function main() {
  const tiles = await prisma.resourceTile.findMany({
    select: { id: true, route: true, label: true }
  });
  console.log('ResourceTiles in database:');
  console.log(JSON.stringify(tiles, null, 2));
  await prisma.$disconnect();
}

main();
