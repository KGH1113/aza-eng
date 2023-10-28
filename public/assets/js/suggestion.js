document.getElementById("menu").addEventListener("click", (event) => {
  event.preventDefault();
  window.open("/", "_self");
});

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, request it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: document.getElementById("input-box").value,
        }),
      })
        .then((response) => {
          if (response.status === 200) {
            Swal.fire(
              "Reqeusted!",
              "Suggestion has been requested.",
              "success"
            ).then(() => {
              location.reload();
            });
          } else {
            Swal.fire(
              "Failed!",
              "Failed to request the suggestion.",
              "error"
            ).then(() => {
              location.reload();
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while trying to send a suggestion request.");
        });
    }
  });
});
