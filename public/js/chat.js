const socket = io();

//inputs

let $messageForm = document.querySelector("#form-data");
let $messageFormInput = $messageForm.querySelector("input");
let $messageFormButton = $messageForm.querySelector("button");
let $sendLocationButton = document.querySelector("#loc");
let $messages = document.querySelector("#message");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate =
  document.querySelector("#url-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-Template").innerHTML;

//autoscroll
const autoScroll=()=>{

  const $newMessage=$messages.lastElementChild

  const newMessagesStyles=getComputedStyles($newMessage)
  const newMessageMargin=parseInt(newMessagesStyles.marginBottom)
  const newMessgeHeight=$newMessage.offsetHeight+newMessageMargin

  //visible height
  const visibleHeight=$messages.offsetHeight

  //heigt of message container
  const containerHeight=$messages.scrollHeight


  //
  const scrollOffset=$messages.scrollTop+visibleHeight

  if(containerHeight-newMessgeHeight<=scrollOffset){

      $messages.scrollTop=$messages.scrollHeight

  }



}

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("newMsg", message, (msg) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    if (msg) {
      return console.log(msg);
    }
    console.log("the msg is delivered!");
  });
  
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar")
    .innerHTML=html
});

socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return alert("geo loaction is not supportedby your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("sendLocation", coordinates, () => {
      console.log("location sent");
      $sendLocationButton.removeAttribute("disabled");
    });
  });
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.emit("join", { username, room }, (err) => {
  if (err) {
    alert(err);
    location.href = "/";
  }
});
