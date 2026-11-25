(() => {
  const form = document.querySelector('#newsletter-form');
  const email = document.querySelector('#newsletter-email');
  const draft = document.querySelector('#newsletter-draft');
  const status = document.querySelector('#newsletter-status');

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const body = [
      'Please add me to the Vesper Brewing newsletter.',
      '',
      'My email address: ' + email.value.trim(),
      '',
      'I confirm that I am of legal drinking age and would like email updates from Vesper.',
    ].join("\n");
    draft.href = 'mailto:vesperbrewingcanada@gmail.com?subject=' +
      encodeURIComponent('Vesper newsletter signup request') + '&body=' + encodeURIComponent(body);
    draft.hidden = false;
    status.textContent = 'Send the request in your email app to join. If it did not open, use the link below. Your subscription is not yet confirmed.';
    draft.click();
  });

  form.addEventListener('input', () => {
    status.textContent = '';
    draft.hidden = true;
    draft.href = form.action;
  });
})();
