require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await Inventory.find({ quantity: { $gt: 5 } }).sort({ category: 1, name: 1 });

  console.log('\nAll items:');
  items.forEach((i) => console.log(`${i.category.padEnd(7)} ${i.name.padEnd(22)} ${i._id}`));

  const first = (cat, n = 1) => items.filter((i) => i.category === cat).slice(0, n).map((i) => String(i._id));

  const body = {
    baseId: first('base')[0],
    sauceId: first('sauce')[0],
    cheeseId: first('cheese')[0],
    veggieIds: first('veggie', 2),
    quantity: 2,
  };

  console.log('\nCopy this into the Thunder Client body:\n');
  console.log(JSON.stringify(body, null, 2));
  await mongoose.disconnect();
})();