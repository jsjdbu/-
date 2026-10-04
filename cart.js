(() => {
  const KEY = "athar-cart-v1";
  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch (error) {
      console.warn("تعذّر تحميل السلة المحفوظة.", error);
      return [];
    }
  };
  let items = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(items));
  window.ATHAR_CART = {
    getItems: () => items.map(item => ({...item})),
    count: () => items.reduce((sum, item) => sum + item.quantity, 0),
    add(id) {
      const found = items.find(item => item.id === id);
      if (found) found.quantity += 1;
      else items.push({id, quantity:1});
      save();
    },
    change(id, amount) {
      const item = items.find(entry => entry.id === id);
      if (!item) return;
      item.quantity += amount;
      if (item.quantity <= 0) items = items.filter(entry => entry.id !== id);
      save();
    },
    remove(id) { items = items.filter(item => item.id !== id); save(); },
    clear() { items = []; save(); }
  };
})();
