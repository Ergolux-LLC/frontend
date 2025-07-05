// src/ui/fragments/navbar/nav.js

export function getNavFragment(navigate) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<nav
  class="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary px-3"
>
  <a class="navbar-brand fw-bold text-light" href="#">
    <i class="bi bi-kanban-fill me-2 text-primary"></i>TC Sales
  </a>
  <button
    class="navbar-toggler"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#mainNav"
    aria-controls="mainNav"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="mainNav">
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      <li class="nav-item">
        <a class="nav-link active" href="#" data-page="dashboard">
          <i class="bi bi-speedometer2 me-1"></i>Dashboard
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" data-page="crm">
          <i class="bi bi-people-fill me-1"></i>CRM
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link text-monospace text-danger opacity-75"
          href="#"
          data-page="crm"
        >
          <i class="bi bi-terminal me-1"></i>D15A8L3D
        </a>
      </li>
    </ul>

    <ul class="navbar-nav ms-auto">
      <li class="nav-item dropdown">
        <a
          class="nav-link dropdown-toggle text-light"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-person-circle me-1"></i>Agent
        </a>
        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark">
          <li><a class="dropdown-item" href="#">Settings</a></li>
          <li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>
        </ul>
      </li>
    </ul>
  </div>
</nav>
`;

  const fragment = wrapper.firstElementChild;
  const logout = fragment.querySelector("#logoutLink");
  if (logout && typeof navigate === "function") {
    logout.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("[nav] Logout clicked, navigating to /");
      navigate("/");
    });
  }

  return fragment;
}
