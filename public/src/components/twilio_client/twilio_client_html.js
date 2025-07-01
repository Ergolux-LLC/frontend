export default `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" />
  <link rel="stylesheet" href="callbar.css" />

  <nav class="call-bar py-2 border-top border-secondary">
    <div class="container-fluid">
      <div class="d-flex flex-wrap align-items-center gap-2">
        <div class="form-check form-switch mb-2">
          <input class="form-check-input state-off" type="checkbox" role="switch" id="startup-toggle" autocomplete="off">
          <label class="form-check-label small" for="startup-toggle">Connect&nbsp;/&nbsp;Disconnect</label>
        </div>

        <input type="tel" class="form-control mb-2" id="phone-number" value="1-512-900-9043" style="max-width:170px" disabled>



        <button class="btn call-toggle mb-2 d-flex align-items-center justify-content-center" id="call-button" disabled>
          <i class="bi bi-telephone-fill"></i>
        </button>

        <div class="flex-grow-1"></div>

        <button class="btn log-btn mb-2" id="logs-btn">
          <i class="bi bi-journal-text"></i>
        </button>
      </div>
    </div>
  </nav>

  <div class="log-overlay" id="log-overlay">
    <button class="btn btn-light mb-3" id="close-logs">
      <i class="bi bi-x-lg"></i>
    </button>
    <h5 class="mb-3">Call Logs</h5>
    <pre id="log">(Logs will appear here)</pre>
  </div>
`;
