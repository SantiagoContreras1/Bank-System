export const parseJsonFields =
  (fields = []) =>
  (req, res, next) => {
    fields.forEach((field) => {
      const value = req.body[field];
      if (typeof value === "string") {
        // Si es un string numérico, conviértelo a número
        if (!isNaN(value) && value.trim() !== "") {
          req.body[field] = Number(value);
        } else {
          // Si no es numérico, intenta parsear JSON
          try {
            req.body[field] = JSON.parse(value);
          } catch (e) {
            // Si falla, deja el valor como string
            req.body[field] = value;
          }
        }
      }
    });
    next();
  };
