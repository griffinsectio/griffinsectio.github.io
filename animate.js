// Select all images that should animate
const animatedImages = document.querySelectorAll('.animated-img');
const details = document.querySelectorAll(".detail");
const profile = document.querySelectorAll("#profile");

const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            // Optionally, remove the class when out of view
            entry.target.classList.remove('visible');
        }
    });
}, { threshold: 0.5 }); // Adjust threshold as needed

animatedImages.forEach((img) => {
    elementObserver.observe(img);
});

details.forEach((detail) => {
    elementObserver.observe(detail);
})

profile.forEach((e) => {
    elementObserver.observe(e);
});
