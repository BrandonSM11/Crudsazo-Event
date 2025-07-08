const swiper = new Swiper('.swiper', {
  loop: true,
  autoplay: {
    delay: 2000, 
    disableOnInteraction: false,
  },
  speed: 1000, 
  effect: 'slide', 
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const date = new Date().toISOString();

      const newMessage = {
        id: Date.now(),
        name,
        email,
        message,
        date
      };

      // Enviar los datos al servidor backend (o local server json)
      try {
        await fetch("http://localhost:3000/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        });
        alert("Mensaje enviado exitosamente");
        form.reset();
      } catch (err) {
        alert("Error al enviar el mensaje");
        console.error(err);
      }
    });
  }
});
