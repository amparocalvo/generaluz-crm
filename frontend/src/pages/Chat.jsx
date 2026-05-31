import { useState } from "react";

const quickReplies = [
  "Cómo crear un cliente",
  "Cómo hacer un presupuesto",
  "Cómo crear una instalación",
  "Cómo exportar un PDF",
];

function getChat(message) {
  const text = message.toLowerCase();

  if (text.includes("cliente")) {
    return "Para crear un cliente entra en el apartado -> Clientes, pulsa -> Nuevo cliente, rellena nombre, teléfono, email, dirección y estado, y guarda el formulario.";
  }

  if (text.includes("presupuesto")) {
    return "Para crear un presupuesto entra en el apartado ->Presupuestos, pulsa -> Nuevo presupuesto y rellena todos los campos. El sistema calculará la instalación automáticamente.";
  }

  if (text.includes("instalación") || text.includes("instalacion")) {
    return "Para crear una instalación primero debe existir un presupuesto aceptado. Después entra en el apartado ->Instalaciones, pulsa -> Nueva instalación y completa los campos.";
  }

  if (text.includes("pdf")) {
    return "Para exportar un PDF abre el detalle del presupuesto y pulsa -> Exportar PDF.";
  }

  if (text.includes("mapa") || text.includes("google")) {
    return "En Instalaciones puedes abrir el mapa de la dirección registrada para localizar la vivienda del cliente y preparar la visita técnica.";
  }

  return "He recibido tu consulta. Revisa el módulo correspondiente o contacta con ayuda@generaluz.es si necesitas una respuesta más personalizada.";
}

function Chat({ currentUser }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "Soporte",
      text: "Hola, ¿como puedo ayudarte?",
      type: "support",
    },
  ]);

  function sendMessage(text = message) {
    const cleanMessage = text.trim();

    if (!cleanMessage) {
      return;
    }

    setMessages((currentMessages) => {
      const nextId = currentMessages.length + 1;

      return [
        ...currentMessages,
        {
          id: nextId,
          author: currentUser?.name || "Usuario",
          text: cleanMessage,
          type: "user",
        },
        {
          id: nextId + 1,
          author: "Soporte",
          text: getChat(cleanMessage),
          type: "support",
        },
      ];
    });
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Soporte interno</span>
          <h1>Ayuda</h1>
          <p>Chat para resolver dudas sobre clientes, presupuestos e instalaciones.</p>
        </div>
      </header>

      <section className="panel help-panel">
        <div className="panel-header">
          <div>
            <h2>Chat de ayuda</h2>
            <p>Consulta rápida para acompañar el uso del CRM.</p>
          </div>
        </div>

        <div className="quick-help">
          {quickReplies.map((reply) => (
            <button
              className="secondary-button"
              key={reply}
              onClick={() => sendMessage(reply)}
              type="button"
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="chat-window">
          {messages.map((item) => (
            <article className={`chat-message ${item.type}`} key={item.id}>
              <span>{item.author}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            aria-label="Mensaje de ayuda"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribe tu duda..."
            value={message}
          />
          <button className="primary-button" type="submit">
            Enviar
          </button>
        </form>
      </section>
    </>
  );
}

export default Chat;
