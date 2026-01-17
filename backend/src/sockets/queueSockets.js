const EVENTS = require("./events");

const registerSocketHandlers = (io, socket) => {
  socket.on(EVENTS.JOIN_QUEUE, ({ shopId }) => {
    socket.join(`shop_${shopId}`);
  });

  socket.on("disconnect", () => {});
};

module.exports = { registerSocketHandlers };
