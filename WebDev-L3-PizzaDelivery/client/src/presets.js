// Names must match the ingredients created by server/seed.js
export const PRESETS = [
  {
    id: 'margherita',
    name: 'Classic Margherita',
    tag: 'Traditional',
    text: 'Thin crust, tomato marinara, mozzarella and ripe tomato.',
    img: 'photo-1604382354936-07c5d9983bd3',
    base: 'Thin Crust', sauce: 'Tomato Marinara', cheese: 'Mozzarella', veggies: ['Tomato'],
  },
  {
    id: 'bbq-veggie',
    name: 'Smokey BBQ Veggie Feast',
    tag: 'Bold and savory',
    text: 'Hand-tossed crust with BBQ sauce, cheddar, mushroom, sweet corn and onion.',
    img: 'photo-1513104890138-7c749659a591',
    base: 'Classic Hand-Tossed', sauce: 'BBQ', cheese: 'Cheddar', veggies: ['Onion', 'Mushroom', 'Sweet Corn'],
  },
  {
    id: 'cheese-burst',
    name: 'Double Cheese Burst',
    tag: 'Rich',
    text: 'Cheese burst base, white garlic sauce, gouda, black olives and jalapeno.',
    img: 'photo-1574071318508-1cdbab80d002',
    base: 'Cheese Burst', sauce: 'White Garlic', cheese: 'Gouda', veggies: ['Black Olives', 'Jalapeno'],
  },
];
