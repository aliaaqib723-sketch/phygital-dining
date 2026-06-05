//MENU ITEMS
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import MenuItem from './models/MenuItem.js';

// Load environmental variables into this independent isolation script
dotenv.config();

// Connect to our cloud cluster
connectDB();

const sampleMenuItems = [
  {
    itemId: "dish_001",
    name: "Special Chicken Biryani",
    category: "Pakistani",
    price: 450,
    description: "Fragrant basmati rice layered with aggressively spiced marinated chicken, soft potatoes, plum extract, and aromatic saffron.",
    ingredients: ["Basmati Rice", "Chicken", "Yogurt", "Potato", "Aloo Bukhara (Dried Plums)", "Saffron", "Kewra Water", "Onions", "Green Chilies", "Biryani Masala Spice Mix"],
    allergens: ["Dairy"],
    spiceLevel: 4,
    nutrition: { calories: 650, protein: "32g", carbohydrates: "78g", fats: "22g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/biryani.glb"
  },
  {
    itemId: "dish_002",
    name: "Mutton Yakhni Pulao",
    category: "Pakistani",
    price: 650,
    description: "A traditional, mildly flavored aromatic rice dish cooked slowly in a rich, seasoned mutton broth infusion.",
    ingredients: ["Basmati Rice", "Mutton Meat", "Mutton Stock (Yakhni)", "Fennel Seeds (Saunf)", "Coriander Seeds", "Ginger", "Garlic", "Fried Onions"],
    allergens: ["None"],
    spiceLevel: 2,
    nutrition: { calories: 710, protein: "38g", carbohydrates: "74g", fats: "26g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/pulao.glb"
  },
  {
    itemId: "dish_003",
    name: "Chicken Red Karahi",
    category: "Pakistani",
    price: 1400,
    description: "Authentic highway-style half-kg chicken prepared in a blazing wok with a heavy tomato reduction, green chilies, and freshly crushed spices.",
    ingredients: ["Chicken", "Tomatoes", "Ginger Juilettes", "Garlic Paste", "Green Chilies", "Crushed Black Pepper", "Coriander Seeds", "Desi Ghee"],
    allergens: ["Dairy"],
    spiceLevel: 5,
    nutrition: { calories: 890, protein: "55g", carbohydrates: "12g", fats: "68g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/red_karahi.glb"
  },
  {
    itemId: "dish_004",
    name: "Chicken White Karahi",
    category: "Pakistani",
    price: 1550,
    description: "A rich, velvety half-kg chicken wok dish cooked using a luxurious dairy cream and yogurt base, seasoned with white pepper.",
    ingredients: ["Chicken", "Dairy Cream", "Yogurt", "White Pepper", "Black Pepper", "Green Chilies", "Butter", "Ginger"],
    allergens: ["Dairy"],
    spiceLevel: 2,
    nutrition: { calories: 980, protein: "52g", carbohydrates: "16g", fats: "78g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/white_karahi.glb"
  },
  {
    itemId: "dish_005",
    name: "Crispy Fried Fish",
    category: "Seafood",
    price: 950,
    description: "Premium river fish fillets marinated in a traditional Lahori spice blend, coated in spiced gram flour batter and deep-fried.",
    ingredients: ["Fish Fillet (Rahu/Talaapia)", "Gram Flour (Besan)", "Carom Seeds (Ajwain)", "Crushed Red Chili Flakes", "Coriander Powder", "Lemon Juice", "Chaat Masala"],
    allergens: ["Fish", "Gluten"],
    spiceLevel: 3,
    nutrition: { calories: 420, protein: "28g", carbohydrates: "24g", fats: "22g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/fried_fish.glb"
  },
  {
    itemId: "dish_006",
    name: "Garden Veg Pizza",
    category: "Italian",
    price: 1100,
    description: "A visually striking thin-crust pizza loaded with house marinara sauce, fresh bell peppers, sweet corn, black olives, onions, and stringy cheese.",
    ingredients: ["Pizza Dough Flours", "Marinara Tomato Sauce", "Mozzarella Cheese", "Green Bell Peppers", "Black Olives", "Red Onions", "Sweet Corn", "Oregano"],
    allergens: ["Dairy", "Gluten"],
    spiceLevel: 1,
    nutrition: { calories: 780, protein: "24g", carbohydrates: "110g", fats: "26g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/veg_pizza.glb"
  },
  {
    itemId: "dish_007",
    name: "Double Cheese Pizza",
    category: "Italian",
    price: 1250,
    description: "The ultimate comfort choice featuring a golden crust overloaded with an extra thick double layer of premium melted mozzarella and sharp cheddar.",
    ingredients: ["Pizza Dough Flours", "Classic Italian Tomato Sauce", "Mozzarella Cheese", "Cheddar Cheese", "Parmesan Dusting", "Olive Oil"],
    allergens: ["Dairy", "Gluten"],
    spiceLevel: 1,
    nutrition: { calories: 940, protein: "36g", carbohydrates: "105g", fats: "42g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/cheese_pizza.glb"
  },
  {
    itemId: "dish_008",
    name: "Crunchy Zinger Burger",
    category: "Fast Food",
    price: 550,
    description: "A huge, ultra-crispy double-battered deep-fried chicken breast piece, topped with crisp iceberg lettuce and signature spicy mayo inside a soft sesame bun.",
    ingredients: ["Crispy Battered Chicken Breast", "Sesame Seed Bun", "Iceberg Lettuce", "Spicy Mayonnaise Spray", "Buttermilk Coating Brine", "White Pepper"],
    allergens: ["Gluten", "Eggs", "Dairy"],
    spiceLevel: 3,
    nutrition: { calories: 580, protein: "34g", carbohydrates: "48g", fats: "28g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/zinger.glb"
  },
  {
    itemId: "dish_009",
    name: "Creamy Alfredo Pasta",
    category: "Italian",
    price: 890,
    description: "Fettuccine pasta boiled al dente and folded into a luxurious, thick, buttery parmesan cream sauce topped with tender sliced grilled chicken and mushrooms.",
    ingredients: ["Fettuccine Pasta", "Heavy Dairy Cream", "Parmesan Cheese", "Garlic Butter", "Grilled Chicken Strips", "Button Mushrooms", "Parsley Flakes"],
    allergens: ["Dairy", "Gluten"],
    spiceLevel: 1,
    nutrition: { calories: 820, protein: "41g", carbohydrates: "62g", fats: "46g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/pasta.glb"
  },
  {
    itemId: "dish_010",
    name: "Fiery Chicken Dynamite",
    category: "Appetizers",
    price: 750,
    description: "Crispy popcorn-style chicken bites completely tossed and glazed in our addictive, sweet, creamy, and aggressively spicy sriracha-infused dynamite dressing.",
    ingredients: ["Chicken Breast Cubes", "Cornstarch Coating Mix", "Dynamite Mayonnaise Sauce", "Sriracha Hot Sauce", "Pure Honey", "Green Onion Garnish"],
    allergens: ["Eggs"],
    spiceLevel: 4,
    nutrition: { calories: 490, protein: "26g", carbohydrates: "32g", fats: "30g" },
    arModelUrl: "https://raw.githubusercontent.com/username/repo/main/assets/dynamite.glb"
  }
];

const importData = async () => {
  try {
    await MenuItem.deleteMany();
    console.log(' Old data wiped clean from cloud cluster...');

    await MenuItem.insertMany(sampleMenuItems);
    console.log(' SAMPLE MENU ITEMS SEEDED INTO MONGODB ATLAS SUCCESSFULLY!');
    
    process.exit(0);
  } catch (error) {
    console.error(` SEEDER ENGINE OPERATION FAILURE: ${error.message}`);
    process.exit(1);
  }
};

importData();