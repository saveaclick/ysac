main = document.getElementById("mainID")
theme = document.getElementById("themeID")


theme.addEventListener("click", function(event) {
    if (main.classList.contains("light-mode")) {
        theme.src = "night-icon.svg"
        main.classList.remove("light-mode");
        event.preventDefault();
    } else {
        theme.src = "day-icon.svg"
        main.classList.add("light-mode");
        event.preventDefault();
    }
});
