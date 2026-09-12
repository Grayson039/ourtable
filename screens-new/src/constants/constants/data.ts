// ─────────────────────────────────────────────────────────────
// OurTable — Mock Data
// Replace with real API calls / Supabase / Firebase
// ─────────────────────────────────────────────────────────────

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  time: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  savedBy: string;   // household member who saved it
  heroColor: string; // gradient fallback when no photo
  heroColor2: string;
  ingredients: { amount: string; unit: string; name: string }[];
  instructions: { step: number; text: string }[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
  dietaryFlags: string[];
};

export type GroceryItem = {
  id: number;
  name: string;
  qty: string;
  aisle: string;
  recipe: string;
  checked: boolean;
  emoji: string;
};

export type HouseholdMember = {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  avatar: string;
  dietaryRestrictions: string[];
};

export type FridgeItem = {
  id: number;
  name: string;
  emoji: string;
  expiry: string;
  qty: string;
  category: string;
};

// ── Recipes ───────────────────────────────────────────────────
export const RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Tuscan Salmon',
    description: 'Pan-seared salmon in a rich sun-dried tomato cream sauce with fresh spinach and parmesan.',
    category: 'Dinner',
    tags: ['Seafood', 'Italian', 'Gluten-Free'],
    time: '25 min',
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    savedBy: 'Sarah',
    heroColor: '#1B3A5C',
    heroColor2: '#2E5C8A',
    ingredients: [
      { amount: '4', unit: '× 6oz', name: 'Salmon fillets' },
      { amount: '3', unit: 'cups', name: 'Baby spinach' },
      { amount: '1', unit: 'cup', name: 'Cherry tomatoes, halved' },
      { amount: '⅓', unit: 'cup', name: 'Sun-dried tomatoes' },
      { amount: '1', unit: 'cup', name: 'Heavy cream' },
      { amount: '½', unit: 'cup', name: 'Parmesan, grated' },
      { amount: '4', unit: 'cloves', name: 'Garlic, minced' },
      { amount: '2', unit: 'tbsp', name: 'Olive oil' },
      { amount: '1', unit: '', name: 'Lemon, zested & juiced' },
      { amount: '¼', unit: 'cup', name: 'Fresh basil' },
      { amount: '1', unit: 'pinch', name: 'Red pepper flakes' },
      { amount: '', unit: 'to taste', name: 'Salt & black pepper' },
    ],
    instructions: [
      { step: 1, text: 'Pat salmon dry with paper towels and season generously with salt and pepper on both sides.' },
      { step: 2, text: 'Heat olive oil in a large skillet over medium-high heat until shimmering. Add salmon skin-side up and cook 4 minutes until golden. Flip and cook 2–3 more minutes. Remove and set aside.' },
      { step: 3, text: 'Reduce heat to medium. Add garlic and red pepper flakes; sauté 30 seconds until fragrant.' },
      { step: 4, text: 'Add sun-dried tomatoes and cherry tomatoes. Cook 2 minutes, stirring occasionally.' },
      { step: 5, text: 'Pour in heavy cream and bring to a gentle simmer. Stir in parmesan until melted and sauce coats the back of a spoon.' },
      { step: 6, text: 'Add spinach and stir until just wilted, about 1 minute. Add lemon zest and juice.' },
      { step: 7, text: 'Return salmon to the pan. Spoon sauce over the top and heat through, 1–2 minutes.' },
      { step: 8, text: 'Garnish with fresh basil and serve immediately with crusty bread or pasta.' },
    ],
    nutrition: { calories: 520, protein: '42g', carbs: '8g', fat: '34g' },
    dietaryFlags: ['Gluten-Free', 'High-Protein'],
  },
  {
    id: '2',
    title: 'Grandma\'s Pasta',
    description: 'A slow-simmered Sunday sauce passed down three generations. Simple ingredients, extraordinary flavour.',
    category: 'Dinner',
    tags: ['Italian', 'Comfort Food', 'Family Recipe'],
    time: '1 hr 20 min',
    servings: 6,
    difficulty: 'Easy',
    rating: 5.0,
    savedBy: 'Will',
    heroColor: '#5A3010',
    heroColor2: '#8B4513',
    ingredients: [
      { amount: '500g', unit: '', name: 'Penne pasta' },
      { amount: '2 ×', unit: '400g', name: 'Canned whole tomatoes' },
      { amount: '500g', unit: '', name: 'Italian sausage, casings removed' },
      { amount: '1', unit: 'medium', name: 'Yellow onion, diced' },
      { amount: '6', unit: 'cloves', name: 'Garlic, sliced' },
      { amount: '¼', unit: 'cup', name: 'Olive oil' },
      { amount: '1', unit: 'tsp', name: 'Sugar' },
      { amount: '1', unit: 'handful', name: 'Fresh basil' },
      { amount: '', unit: 'to taste', name: 'Salt, red pepper flakes' },
    ],
    instructions: [
      { step: 1, text: 'Heat olive oil over medium heat. Add onion and cook until soft and translucent, about 8 minutes.' },
      { step: 2, text: 'Add sausage and break apart with a wooden spoon. Cook until browned, 6–8 minutes.' },
      { step: 3, text: 'Add garlic and cook 1 minute. Add canned tomatoes, crushing by hand as you add them.' },
      { step: 4, text: 'Season with salt, red pepper flakes, and sugar. Reduce heat to low and simmer uncovered 45 minutes, stirring occasionally.' },
      { step: 5, text: 'Cook pasta in heavily salted water until al dente. Reserve 1 cup pasta water before draining.' },
      { step: 6, text: 'Toss pasta with sauce, adding pasta water as needed for consistency. Top with fresh basil.' },
    ],
    nutrition: { calories: 680, protein: '28g', carbs: '72g', fat: '30g' },
    dietaryFlags: [],
  },
  {
    id: '3',
    title: 'Blueberry Lemon Pancakes',
    description: 'Light, fluffy weekend pancakes with a burst of fresh blueberries and bright lemon zest.',
    category: 'Breakfast',
    tags: ['Breakfast', 'Vegetarian', 'Weekend'],
    time: '20 min',
    servings: 4,
    difficulty: 'Easy',
    rating: 4.6,
    savedBy: 'Emma',
    heroColor: '#2A3A6A',
    heroColor2: '#3A5090',
    ingredients: [
      { amount: '1½', unit: 'cups', name: 'All-purpose flour' },
      { amount: '2', unit: 'tbsp', name: 'Sugar' },
      { amount: '2', unit: 'tsp', name: 'Baking powder' },
      { amount: '½', unit: 'tsp', name: 'Salt' },
      { amount: '1¼', unit: 'cups', name: 'Whole milk' },
      { amount: '2', unit: '', name: 'Eggs' },
      { amount: '3', unit: 'tbsp', name: 'Melted butter' },
      { amount: '1', unit: '', name: 'Lemon, zested' },
      { amount: '1', unit: 'cup', name: 'Fresh blueberries' },
    ],
    instructions: [
      { step: 1, text: 'Whisk together flour, sugar, baking powder, and salt in a large bowl.' },
      { step: 2, text: 'In a separate bowl, whisk milk, eggs, melted butter, and lemon zest.' },
      { step: 3, text: 'Fold wet ingredients into dry until just combined — lumps are fine. Fold in blueberries.' },
      { step: 4, text: 'Heat a griddle over medium heat and lightly butter. Pour ¼ cup batter per pancake.' },
      { step: 5, text: 'Cook until bubbles form on surface, 2–3 minutes. Flip and cook 1–2 more minutes.' },
      { step: 6, text: 'Serve with maple syrup and extra blueberries.' },
    ],
    nutrition: { calories: 340, protein: '10g', carbs: '52g', fat: '10g' },
    dietaryFlags: ['Vegetarian'],
  },
  {
    id: '4',
    title: 'Thai Green Curry',
    description: 'Fragrant, vibrant green curry with coconut milk, fresh vegetables, and your choice of protein.',
    category: 'Dinner',
    tags: ['Thai', 'Dairy-Free', 'Spicy'],
    time: '35 min',
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    savedBy: 'Mike',
    heroColor: '#1A4A1A',
    heroColor2: '#2A6A2A',
    ingredients: [
      { amount: '2', unit: 'tbsp', name: 'Green curry paste' },
      { amount: '2 ×', unit: '400ml', name: 'Coconut milk' },
      { amount: '500g', unit: '', name: 'Chicken thighs, sliced' },
      { amount: '1', unit: '', name: 'Zucchini, sliced' },
      { amount: '1', unit: 'cup', name: 'Snow peas' },
      { amount: '1', unit: '', name: 'Red bell pepper, sliced' },
      { amount: '2', unit: 'tbsp', name: 'Fish sauce' },
      { amount: '1', unit: 'tbsp', name: 'Palm or brown sugar' },
      { amount: '6', unit: '', name: 'Kaffir lime leaves' },
      { amount: '1', unit: 'handful', name: 'Thai basil' },
      { amount: '2', unit: 'cups', name: 'Jasmine rice, cooked' },
    ],
    instructions: [
      { step: 1, text: 'Heat a wok or large pan over high heat. Add curry paste and fry 30 seconds until fragrant.' },
      { step: 2, text: 'Add thick coconut cream from one can, stirring to combine with paste. Cook 2 minutes.' },
      { step: 3, text: 'Add chicken and cook through, about 6 minutes.' },
      { step: 4, text: 'Pour in remaining coconut milk. Add fish sauce, sugar, and lime leaves.' },
      { step: 5, text: 'Add vegetables and simmer 4–5 minutes until tender-crisp.' },
      { step: 6, text: 'Finish with Thai basil. Serve over jasmine rice with lime wedges.' },
    ],
    nutrition: { calories: 580, protein: '36g', carbs: '42g', fat: '28g' },
    dietaryFlags: ['Dairy-Free', 'Gluten-Free'],
  },
];

// ── Grocery Items ─────────────────────────────────────────────
export const GROCERY_ITEMS: GroceryItem[] = [
  { id: 0,  name: 'Baby spinach',       qty: '3 cups',   aisle: 'Produce',    recipe: 'Tuscan Salmon',    checked: false, emoji: '🥬' },
  { id: 1,  name: 'Cherry tomatoes',    qty: '1 cup',    aisle: 'Produce',    recipe: 'Tuscan Salmon',    checked: false, emoji: '🍅' },
  { id: 2,  name: 'Lemon',              qty: '1',        aisle: 'Produce',    recipe: 'Tuscan Salmon',    checked: true,  emoji: '🍋' },
  { id: 3,  name: 'Fresh basil',        qty: '¼ cup',    aisle: 'Produce',    recipe: 'Tuscan Salmon',    checked: false, emoji: '🌿' },
  { id: 4,  name: 'Garlic',             qty: '1 head',   aisle: 'Produce',    recipe: 'Multiple',         checked: true,  emoji: '🧄' },
  { id: 5,  name: 'Salmon fillets',     qty: '4 × 6oz',  aisle: 'Meat & Fish',recipe: 'Tuscan Salmon',    checked: false, emoji: '🐟' },
  { id: 6,  name: 'Heavy cream',        qty: '1 cup',    aisle: 'Dairy',      recipe: 'Tuscan Salmon',    checked: false, emoji: '🥛' },
  { id: 7,  name: 'Parmesan',           qty: '½ cup',    aisle: 'Dairy',      recipe: 'Tuscan Salmon',    checked: false, emoji: '🧀' },
  { id: 8,  name: 'Butter, unsalted',   qty: '2 tbsp',   aisle: 'Dairy',      recipe: 'Multiple',         checked: true,  emoji: '🧈' },
  { id: 9,  name: 'Sun-dried tomatoes', qty: '⅓ cup',    aisle: 'Pantry',     recipe: 'Tuscan Salmon',    checked: false, emoji: '🫙' },
  { id: 10, name: 'Chicken stock',      qty: '½ cup',    aisle: 'Pantry',     recipe: 'Tuscan Salmon',    checked: false, emoji: '🍲' },
  { id: 11, name: 'Olive oil',          qty: '2 tbsp',   aisle: 'Pantry',     recipe: 'Multiple',         checked: true,  emoji: '🫒' },
  { id: 12, name: 'Penne pasta',        qty: '500g',     aisle: 'Pantry',     recipe: 'Grandma\'s Pasta', checked: false, emoji: '🍝' },
  { id: 13, name: 'Canned tomatoes',    qty: '2 × 400g', aisle: 'Pantry',     recipe: 'Grandma\'s Pasta', checked: false, emoji: '🥫' },
  { id: 14, name: 'Red pepper flakes',  qty: 'pinch',    aisle: 'Spices',     recipe: 'Tuscan Salmon',    checked: false, emoji: '🌶️' },
  { id: 15, name: 'Greek yoghurt',      qty: '500g',     aisle: 'Dairy',      recipe: 'Snacks',           checked: false, emoji: '🫙' },
];

// ── Household ─────────────────────────────────────────────────
export const HOUSEHOLD_MEMBERS: HouseholdMember[] = [
  { id: 'will',  name: 'Will',  role: 'Admin',  avatar: 'W', dietaryRestrictions: [] },
  { id: 'sarah', name: 'Sarah', role: 'Member', avatar: 'S', dietaryRestrictions: ['Gluten-Free'] },
  { id: 'emma',  name: 'Emma',  role: 'Member', avatar: 'E', dietaryRestrictions: ['Vegetarian'] },
  { id: 'mike',  name: 'Mike',  role: 'Member', avatar: 'M', dietaryRestrictions: [] },
];

// ── Fridge Items ──────────────────────────────────────────────
export const FRIDGE_ITEMS: FridgeItem[] = [
  { id: 0,  name: 'Salmon fillets',   emoji: '🐟', expiry: 'Tomorrow',    qty: '4',     category: 'Meat & Fish' },
  { id: 1,  name: 'Baby spinach',     emoji: '🥬', expiry: 'In 3 days',   qty: '200g',  category: 'Produce' },
  { id: 2,  name: 'Heavy cream',      emoji: '🥛', expiry: 'In 5 days',   qty: '1 cup', category: 'Dairy' },
  { id: 3,  name: 'Parmesan',         emoji: '🧀', expiry: 'In 2 weeks',  qty: '100g',  category: 'Dairy' },
  { id: 4,  name: 'Cherry tomatoes',  emoji: '🍅', expiry: 'In 4 days',   qty: '1 cup', category: 'Produce' },
  { id: 5,  name: 'Butter',           emoji: '🧈', expiry: 'In 3 weeks',  qty: '200g',  category: 'Dairy' },
  { id: 6,  name: 'Eggs',             emoji: '🥚', expiry: 'In 2 weeks',  qty: '6',     category: 'Dairy' },
  { id: 7,  name: 'Lemon',            emoji: '🍋', expiry: 'In 1 week',   qty: '2',     category: 'Produce' },
];

// ── Diet options for onboarding ───────────────────────────────
export const DIET_OPTIONS = [
  { id: 'vegetarian',  label: 'Vegetarian',  emoji: '🥦' },
  { id: 'vegan',       label: 'Vegan',       emoji: '🌱' },
  { id: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'dairy-free',  label: 'Dairy-Free',  emoji: '🥛' },
  { id: 'nut-free',    label: 'Nut-Free',    emoji: '🥜' },
  { id: 'keto',        label: 'Keto',        emoji: '🥑' },
  { id: 'halal',       label: 'Halal',       emoji: '✅' },
  { id: 'kosher',      label: 'Kosher',      emoji: '✡️' },
];
