(() => {
  const beers = [
    {
      name: "Lantern Hour", style: "Vienna lager", abv: "5.2%", color: "#ed5e73",
      line: "A bright ember.", description: "Malted barley sets the tone for this Vienna lager.",
      character: "Malted barley, hops, and lager yeast shape Lantern Hour.",
      ingredients: "Water, malted barley, hops, lager yeast.",
      design: "The lantern motif", label: "Red facets and sweeping lines frame a beam of gold.",
    },
    {
      name: "Velvet Eclipse", style: "Oatmeal stout", abv: "5.8%", color: "#5294f6",
      line: "Dark beer. Soft landing.", description: "Roasted barley and oats give this dark stout its depth and smooth finish.",
      character: "Roasted barley brings the dark character. Oats give the stout its soft, rounded body.",
      ingredients: "Water, malted barley, oats, roasted barley, hops, ale yeast.",
      design: "A ring of light.", label: "A cobalt halo wraps around a dark disc, edged in gold.",
    },
    {
      name: "Pine Veil", style: "West Coast IPA", abv: "6.5%", color: "#63bb83",
      line: "Through the pines.", description: "Pale barley malt and hops form the base of this West Coast IPA.",
      character: "Pine Veil pairs pale barley malt with hops and ale yeast.",
      ingredients: "Water, pale barley malt, hops, ale yeast.",
      design: "Cut from green.", label: "Angular green facets meet narrow gold edges.",
    },
    {
      name: "Ember Fall", style: "Amber ale", abv: "5.4%", color: "#f07855",
      line: "The glow after dark.", description: "Caramel malt adds depth to this amber ale.",
      character: "Ember Fall brings malted barley and caramel malt together with hops and ale yeast.",
      ingredients: "Water, malted barley, caramel malt, hops, ale yeast.",
      design: "Ribbons of heat.", label: "Layers of red, amber, and gold sweep across the wrap.",
    },
    {
      name: "Golden Still", style: "Kölsch", abv: "4.8%", color: "#e7be4d",
      line: "A moment in gold.", description: "Pilsner malt leads this Kölsch.",
      character: "Pilsner malt, hops, and yeast make up Golden Still.",
      ingredients: "Water, pilsner malt, hops, yeast.",
      design: "Gold on the horizon.", label: "Bands of yellow rise above long, fine reflections.",
    },
    {
      name: "Midnight Bloom", style: "Belgian dubbel", abv: "6.8%", color: "#ba8af3",
      line: "After midnight.", description: "Dark barley malt forms the base of this Belgian dubbel.",
      character: "Midnight Bloom combines dark barley malt, sugar, hops, and yeast.",
      ingredients: "Water, dark barley malt, sugar, hops, yeast.",
      design: "The violet curl.", label: "A curl of violet and gold unfolds across the dark wrap.",
    },
  ];
  const textures = window.vesperLabelTextures;
  const buttons = [...document.querySelectorAll("[data-label]")];
  const label = document.querySelector(".label-preview img");
  const dialog = document.querySelector("#label-dialog");
  const zoom = document.querySelector("#label-scale");
  const scroll = dialog.querySelector(".label-scroll");
  const enlarged = scroll.querySelector("img");
  const title = document.querySelector("#release-name");
  const release = document.querySelector(".hero");
  let selected = 1;

  function set(selector, value) {
    document.querySelector(selector).textContent = value;
  }

  function choose(index) {
    selected = index;
    const beer = beers[index];
    const space = beer.name.indexOf(" ");
    title.replaceChildren(beer.name.slice(0, space), document.createElement("br"), beer.name.slice(space + 1));
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.label) === index));
    }
    release.style.setProperty("--release-color", beer.color);
    set("#availability-beer", beer.name);
    document.querySelector('[data-availability-link]').href = 'mailto:vesperbrewingcanada@gmail.com?subject=' + encodeURIComponent('Where to buy ' + beer.name);
    set("#hero-style", beer.style);
    set(".lede", beer.line);
    set(".hero-description", beer.description);
    set("#beer-heading", index === 1 ? "Roast meets softness." : beer.name);
    set(".beer-detail > p:first-child", beer.character);
    set("#beer-style", beer.style);
    set("#beer-strength", `${beer.abv} alc/vol`);
    set("#can-strength", `${beer.abv} alc/vol`);
    set("#beer-ingredients", beer.ingredients);
    set("#label-heading", beer.design);
    set("#label-description", beer.label);
    label.src = textures[index];
    label.alt = `${beer.name} flat label artwork`;
    document.querySelector('.label-preview').setAttribute('aria-label', `View ${beer.name} label artwork`);
    window.vesperCan?.showLabel(textures[index], beer.name).catch(error => {
      console.warn("Can preview could not load.", error);
    });
  }

  function setFullSize(full) {
    scroll.classList.toggle("is-full-size", full);
    zoom.setAttribute("aria-pressed", String(full));
    zoom.textContent = full ? "Fit to view" : "Full size";
    scroll.scrollTo(full ? (scroll.scrollWidth - scroll.clientWidth) / 2 : 0, 0);
  }
  function openLabel() {
    const beer = beers[selected];
    set("#label-dialog-title", `${beer.name} label`);
    enlarged.src = textures[selected];
    enlarged.alt = `${beer.name} full label artwork`;
    dialog.showModal();
    setFullSize(false);
  }
  zoom.addEventListener("click", () => setFullSize(zoom.getAttribute("aria-pressed") === "false"));
  document.querySelectorAll(".label-preview, .label-zoom").forEach(button => button.addEventListener("click", openLabel));
  for (const button of buttons) button.addEventListener("click", () => choose(Number(button.dataset.label)));
  choose(selected);
})();
