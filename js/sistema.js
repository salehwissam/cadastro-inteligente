"use strict";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const form             = $("#cadastroForm");
const nome             = $("#nome");
const email            = $("#email");
const senha            = $("#senha");
const confirmarSenha   = $("#confirmarSenha");
const termos           = $("#termos");
const submitBtn        = $("#submitBtn");
const mensagemSucesso  = $("#mensagemSucesso");
const progressBar      = $("#progressBar");
const progressLabel    = $("#progressLabel");
const toggleSenha      = $("#toggleSenha");
const toggleConfirmar  = $("#toggleConfirmar");
const strengthText     = $("#strengthText");

const segments = [$("#seg1"), $("#seg2"), $("#seg3"), $("#seg4")];

const reqMap = {
  len:     $("#req-len"),
  upper:   $("#req-upper"),
  num:     $("#req-num"),
  special: $("#req-special"),
};

const ICON_CHECK = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="var(--success)" stroke-width="2.5"
       stroke-linecap="round" stroke-linejoin="round"
       aria-label="Campo válido" role="img">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;

const ICON_X = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="var(--error)" stroke-width="2.5"
       stroke-linecap="round" stroke-linejoin="round"
       aria-label="Campo inválido" role="img">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;

const validarNome = (valor) => {
  const v = valor.trim();
  if (!v)            return { valido: false, mensagem: "Nome é obrigatório." };
  if (v.length < 3)  return { valido: false, mensagem: "O nome deve ter pelo menos 3 caracteres." };
  if (v.length > 60) return { valido: false, mensagem: "O nome pode ter no máximo 60 caracteres." };
  if (!/^[\p{L}\s'-]+$/u.test(v))
                     return { valido: false, mensagem: "Use apenas letras, espaços e hífens." };
  return { valido: true, mensagem: "" };
};

const validarEmail = (valor) => {
  const v = valor.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!v)          return { valido: false, mensagem: "E-mail é obrigatório." };
  if (!re.test(v)) return { valido: false, mensagem: "Digite um e-mail válido (ex: nome@dominio.com)." };
  return { valido: true, mensagem: "" };
};

const validarSenha = (valor) => {
  if (!valor)               return { valido: false, mensagem: "Senha é obrigatória." };
  if (valor.length < 8)     return { valido: false, mensagem: "A senha deve ter no mínimo 8 caracteres." };
  if (!/[A-Z]/.test(valor)) return { valido: false, mensagem: "Adicione pelo menos 1 letra maiúscula." };
  if (!/[0-9]/.test(valor)) return { valido: false, mensagem: "Adicione pelo menos 1 número." };
  return { valido: true, mensagem: "" };
};

const validarConfirmacao = (valor) => {
  if (!valor)                return { valido: false, mensagem: "Confirme sua senha." };
  if (valor !== senha.value) return { valido: false, mensagem: "As senhas não coincidem." };
  return { valido: true, mensagem: "" };
};

const validarTermos = () => {
  if (!termos.checked) return { valido: false, mensagem: "Você precisa aceitar os termos para continuar." };
  return { valido: true, mensagem: "" };
};

const validarCampo = (input, validatorFn, showStatus = true) => {
  const errorEl = $(`#${input.id}-error`);
  const { valido, mensagem } = validatorFn(input.value);
  const statusEl = input.closest(".input-wrap")?.querySelector(".input-status");

  if (!valido) {
    input.classList.add("error");
    input.classList.remove("success");
    input.setAttribute("aria-invalid", "true");
    if (errorEl) errorEl.textContent = mensagem;
    if (statusEl && showStatus) statusEl.innerHTML = ICON_X;
  } else {
    input.classList.remove("error");
    input.classList.add("success");
    input.setAttribute("aria-invalid", "false");
    if (errorEl) errorEl.textContent = "";
    if (statusEl && showStatus) statusEl.innerHTML = ICON_CHECK;
  }

  return valido;
};

const MAX_NOME = 60;
const nomeHint = $("#nome-hint");

const atualizarContador = (valor) => {
  const len = valor.trim().length;
  nomeHint.textContent = `${len} / ${MAX_NOME}`;
  nomeHint.style.color = len > MAX_NOME ? "var(--error)" : "var(--text-muted)";
};

const FIELDS = [nome, email, senha, confirmarSenha];
const VALIDATORS = [validarNome, validarEmail, validarSenha, validarConfirmacao];

const atualizarProgresso = () => {
  const valid = FIELDS.filter((f, i) => VALIDATORS[i](f.value).valido).length;
  const termosOk = termos.checked ? 1 : 0;
  const total = FIELDS.length + 1;
  const pct = Math.round(((valid + termosOk) / total) * 100);

  progressBar.classList.add("progress-fill");
  progressBar.style.setProperty("--progress", pct / 100);
  progressLabel.textContent = `${pct}% preenchido`;
  progressBar.closest(".form-progress")?.setAttribute("aria-valuenow", pct);
};

const analisarSenha = (valor) => {
  const reqs = {
    len:     valor.length >= 8,
    upper:   /[A-Z]/.test(valor),
    num:     /[0-9]/.test(valor),
    special: /[^A-Za-z0-9]/.test(valor),
  };
  const pontos = Object.values(reqs).filter(Boolean).length;
  return { pontos, reqs };
};

const STRENGTH_CONFIGS = [
  null,
  { label: "Fraca — adicione mais complexidade", color: "var(--weak)",   segs: 1 },
  { label: "Média — está quase lá!",             color: "var(--medium)", segs: 2 },
  { label: "Boa — só falta um especial",         color: "var(--good)",   segs: 3 },
  { label: "Forte — senha excelente! 🔐",        color: "var(--strong)", segs: 4 },
];

const atualizarForcaSenha = (valor) => {
  if (!valor) {
    segments.forEach(s => {
      s.classList.remove("active");
      s.style.background = "";
      s.style.boxShadow = "";
    });
    strengthText.textContent = "";
    Object.values(reqMap).forEach(el => el?.classList.remove("met"));
    return;
  }

  const { pontos, reqs } = analisarSenha(valor);
  const cfg = STRENGTH_CONFIGS[pontos];

  segments.forEach((s, i) => {
    if (i < cfg.segs) {
      s.classList.add("active");
      s.style.background = cfg.color;
      s.style.boxShadow = `0 0 10px ${cfg.color}80`;
    } else {
      s.classList.remove("active");
      s.style.background = "";
      s.style.boxShadow = "";
    }
  });

  Object.entries(reqs).forEach(([key, met]) => {
    reqMap[key]?.classList.toggle("met", met);
  });

  strengthText.textContent = cfg.label;
  strengthText.style.color = cfg.color;
};

const criarToggleSenha = (btn, inputEl) => {
  const eyeOpen   = btn.querySelector(".eye-open");
  const eyeClosed = btn.querySelector(".eye-closed");

  btn.addEventListener("click", () => {
    const isPassword = inputEl.type === "password";
    inputEl.type = isPassword ? "text" : "password";

    eyeOpen.style.display   = isPassword ? "none"  : "block";
    eyeClosed.style.display = isPassword ? "block" : "none";

    btn.setAttribute("aria-pressed", String(isPassword));
    btn.setAttribute("aria-label",   isPassword ? "Ocultar senha" : "Mostrar senha");

    inputEl.focus();
  });
};

criarToggleSenha(toggleSenha, senha);
criarToggleSenha(toggleConfirmar, confirmarSenha);

nome.addEventListener("blur",           () => validarCampo(nome, validarNome));
email.addEventListener("blur",          () => validarCampo(email, validarEmail));
senha.addEventListener("blur",          () => validarCampo(senha, validarSenha));
confirmarSenha.addEventListener("blur", () => validarCampo(confirmarSenha, validarConfirmacao));

nome.addEventListener("input", ({ target }) => {
  atualizarContador(target.value);
  atualizarProgresso();
  if (target.classList.contains("error") || target.classList.contains("success")) {
    validarCampo(nome, validarNome);
  }
});

email.addEventListener("input", ({ target }) => {
  atualizarProgresso();
  if (target.classList.contains("error") || target.classList.contains("success")) {
    validarCampo(email, validarEmail);
  }
});

senha.addEventListener("input", ({ target }) => {
  atualizarForcaSenha(target.value);
  atualizarProgresso();

  if (target.value.trim()) {
    validarCampo(senha, validarSenha);
  }

  if (confirmarSenha.value.trim()) {
    validarCampo(confirmarSenha, validarConfirmacao);
  }
});

confirmarSenha.addEventListener("input", ({ target }) => {
  atualizarProgresso();
  if (target.value.trim()) {
    validarCampo(confirmarSenha, validarConfirmacao);
  }
});

termos.addEventListener("change", () => {
  const errEl = $("#termos-error");
  if (termos.checked && errEl) errEl.textContent = "";
  atualizarProgresso();
});

const resetarFormulario = () => {
  form.reset();

  [nome, email, senha, confirmarSenha].forEach(campo => {
    campo.classList.remove("error", "success");
    campo.removeAttribute("aria-invalid");
    const statusEl = campo.closest(".input-wrap")?.querySelector(".input-status");
    if (statusEl) statusEl.innerHTML = "";
  });

  $$(".error-msg").forEach(el => el.textContent = "");

  atualizarForcaSenha("");

  progressBar.classList.add("progress-fill");
  progressBar.style.setProperty("--progress", 0);
  progressLabel.textContent = "0% preenchido";
  progressBar.closest(".form-progress")?.setAttribute("aria-valuenow", 0);

  atualizarContador("");
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const nomeOk    = validarCampo(nome, validarNome);
  const emailOk   = validarCampo(email, validarEmail);
  const senhaOk   = validarCampo(senha, validarSenha);
  const confirmOk = validarCampo(confirmarSenha, validarConfirmacao);
  const termosOk  = (() => {
    const { valido, mensagem } = validarTermos();
    const errEl = $("#termos-error");
    if (errEl) errEl.textContent = valido ? "" : mensagem;
    return valido;
  })();

  mensagemSucesso.textContent = "";
  mensagemSucesso.classList.remove("visible");

  if (!(nomeOk && emailOk && senhaOk && confirmOk && termosOk)) {
    const primeiroCampoInvalido = [nome, email, senha, confirmarSenha, termos]
      .find(campo => campo.classList.contains("error") || (!termos.checked && campo === termos));
    primeiroCampoInvalido?.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.classList.add("loading");
  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.setAttribute("aria-label", "Enviando formulário...");

  setTimeout(() => {
    resetarFormulario();

    mensagemSucesso.textContent = "Cadastro realizado com sucesso!";
    mensagemSucesso.classList.add("visible");

    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
    submitBtn.setAttribute("aria-busy", "false");
    submitBtn.setAttribute("aria-label", "Criar minha conta");

    mensagemSucesso.focus();

    setTimeout(() => {
      mensagemSucesso.classList.remove("visible");
      setTimeout(() => { mensagemSucesso.textContent = ""; }, 400);
    }, 5000);

  }, 2000);
});

atualizarProgresso();
atualizarContador("");
