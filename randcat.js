profilePortrait = document.querySelectorAll('#profile .portrait')
images = document.querySelectorAll('.animated-img');

fetch('https://api.thecatapi.com/v1/images/search')
.then(response => response.json())
.then(data => {
    profilePortrait[0].src = data[0].url;
})
.catch(error => console.error('Error fetching image URL:', error));

for (let i = 0; i < 3; i++) {
    fetch('https://api.thecatapi.com/v1/images/search')
        .then(response => response.json())
        .then(data => {
            images[i].src = data[0].url;
        })
        .catch(error => console.error('Error fetching image URL:', error));
}