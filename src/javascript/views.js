fetch('https://nekoweb.org/api/site/info/aomeix.nekoweb.org')
  .then(response => response.json())
  .then(data => {
    const element = document.querySelector('.hitcount');
    if (element) {
      element.textContent = data.views;
    }
  })