// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
//import { PrismaClient } from '@prisma/client';
import prisma  from '../src/prisma/prisma';  

async function main() {
  console.log('🌱 Début du seeding ReLire...');
  
  // Nettoyage des tables
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  
  // Création des utilisateurs
  const user1 = await prisma.user.create({
    data: {
      email: 'sophie.enseignante@edu.qc.ca',
      name: 'Sophie Martin',
      userType: 'TEACHER',
      location: 'Montréal'
    }
  });
  
  const user2 = await prisma.user.create({
    data: {
      email: 'marc.parent@email.com',
      name: 'Marc Dubois',
      userType: 'PARENT',
      location: 'Laval'
    }
  });
  
  const user3 = await prisma.user.create({
    data: {
      email: 'lea.etudiante@email.com',
      name: 'Léa Tremblay',
      userType: 'STUDENT',
      location: 'Québec'
    }
  });
  
  // Création des livres
  const book1 = await prisma.book.create({
    data: {
      title: 'Le Petit Prince',
      author: 'Antoine de Saint-Exupéry',
      isbn: '9782070612758',
      category: 'CHILDREN',
      ageRange: '8-12',
      schoolLevel: 'primaire',
      language: 'fr'
    }
  });
  
  const book2 = await prisma.book.create({
    data: {
      title: 'Mathématiques 1ère année',
      author: 'Ministère Éducation Québec',
      category: 'EDUCATIONAL',
      ageRange: '6-7',
      schoolLevel: 'primaire',
      language: 'fr'
    }
  });
  
  const book3 = await prisma.book.create({
    data: {
      title: 'Harry Potter à l\'école des sorciers',
      author: 'J.K. Rowling',
      isbn: '9782070643028',
      category: 'CHILDREN',
      ageRange: '9-12',
      language: 'fr'
    }
  });
  
  const book4 = await prisma.book.create({
    data: {
      title: 'Introduction à la programmation',
      author: 'David J. Malan',
      category: 'TEXTBOOK',
      schoolLevel: 'cegep',
      language: 'fr'
    }
  });
  
  // Création des annonces
  const listing1 = await prisma.listing.create({
    data: {
      price: 5.99,
      condition: 'VERY_GOOD',
      userId: user1.id,
      bookId: book1.id
    }
  });
  
  const listing2 = await prisma.listing.create({
    data: {
      price: 12.50,
      condition: 'GOOD',
      userId: user2.id,
      bookId: book2.id
    }
  });
  
  const listing3 = await prisma.listing.create({
    data: {
      price: 8.75,
      condition: 'GOOD',
      userId: user3.id,
      bookId: book3.id
    }
  });
  
  const listing4 = await prisma.listing.create({
    data: {
      price: 25.00,
      condition: 'NEW',
      userId: user3.id,
      bookId: book4.id
    }
  });
  
  // Création d'une transaction
  const transaction1 = await prisma.transaction.create({
    data: {
      amount: listing1.price,
      status: 'COMPLETED',
      buyerId: user2.id,
      sellerId: user1.id,
      listingId: listing1.id
    }
  });
  
  // Création d'un avis
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Excellente transaction, livre en parfait état!',
      reviewerId: user2.id,
      revieweeId: user1.id,
      transactionId: transaction1.id
    }
  });
  
  console.log('✅ Seeding terminé avec succès!');
  console.log(`📊 ${await prisma.user.count()} utilisateurs créés`);
  console.log(`📚 ${await prisma.book.count()} livres créés`);
  console.log(`🏷️  ${await prisma.listing.count()} annonces créées`);
  console.log(`💰 ${await prisma.transaction.count()} transactions créées`);
  console.log(`⭐ ${await prisma.review.count()} avis créés`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });