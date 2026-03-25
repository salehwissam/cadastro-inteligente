const form = document.getElementById("cadastroForm");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");
const submitBtn = document.getElementById("submitBtn");
const mensagemSucesso = document.getElementById("mensagemSucesso");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

nome.addEventListener("blur", () => validarCampo(nome, validarNome));
email.addEventListener("blur", () => validarCampo(email, validarEmail));
senha.addEventListener("blur", () => validarCampo(senha, validarSenha));
confirmarSenha.addEventListener("blur", () =>
  validarCampo(confirmarSenha, validarConfirmacao)
);

senha.addEventListener("input", () => {
  atualizarForcaSenha(senha.value);

  if (senha.value.trim() !== "") {
    validarCampo(senha, validarSenha);
  }

  if (confirmarSenha.value.trim() !== "") {
    validarCampo(confirmarSenha, validarConfirmacao);
  }
});

function validarCampo(input, funcaoValidadora) {
  const msgErro = document.getElementById(`${input.id}-error`);
  const resultado = funcaoValidadora(input.value);

  if (!resultado.valido) {
    input.classList.add("error");
    input.classList.remove("success");
    msgErro.textContent = resultado.mensagem;
  } else {
    input.classList.remove("error");
    input.classList.add("success");
    msgErro.textContent = "";
  }

  return resultado.valido;
}

function validarNome(valor) {
  const nomeLimpo = valor.trim();

  if (!nomeLimpo) {
    return {
      valido: false,
      mensagem: "Nome é obrigatório."
    };
  }

  if (nomeLimpo.length < 3) {
    return {
      valido: false,
      mensagem: "O nome deve ter pelo menos 3 caracteres."
    };
  }

  return { valido: true };
}

function validarEmail(valor) {
  const emailLimpo = valor.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailLimpo) {
    return {
      valido: false,
      mensagem: "E-mail é obrigatório."
    };
  }

  if (!regex.test(emailLimpo)) {
    return {
      valido: false,
      mensagem: "Digite um e-mail válido."
    };
  }

  return { valido: true };
}

function validarSenha(valor) {
  if (!valor.trim()) {
    return {
      valido: false,
      mensagem: "Senha é obrigatória."
    };
  }

  if (valor.length < 8) {
    return {
      valido: false,
      mensagem: "A senha deve ter no mínimo 8 caracteres."
    };
  }

  if (!/[A-Z]/.test(valor)) {
    return {
      valido: false,
      mensagem: "A senha precisa ter pelo menos 1 letra maiúscula."
    };
  }

  if (!/[0-9]/.test(valor)) {
    return {
      valido: false,
      mensagem: "A senha precisa ter pelo menos 1 número."
    };
  }

  return { valido: true };
}

function validarConfirmacao(valor) {
  if (!valor.trim()) {
    return {
      valido: false,
      mensagem: "Confirme sua senha."
    };
  }

  if (valor !== senha.value) {
    return {
      valido: false,
      mensagem: "As senhas não coincidem."
    };
  }

  return { valido: true };
}

function atualizarForcaSenha(valor) {
  let pontos = 0;

  if (valor.length >= 8) pontos++;
  if (/[A-Z]/.test(valor)) pontos++;
  if (/[0-9]/.test(valor)) pontos++;
  if (/[^A-Za-z0-9]/.test(valor)) pontos++;

  if (!valor) {
    strengthBar.style.width = "0%";
    strengthBar.style.backgroundColor = "transparent";
    strengthText.textContent = "";
    return;
  }

  if (pontos === 1) {
    strengthBar.style.width = "25%";
    strengthBar.style.backgroundColor = "#c0392b";
    strengthText.textContent = "Força da senha: fraca";
  } else if (pontos === 2) {
    strengthBar.style.width = "50%";
    strengthBar.style.backgroundColor = "#f39c12";
    strengthText.textContent = "Força da senha: média";
  } else if (pontos === 3) {
    strengthBar.style.width = "75%";
    strengthBar.style.backgroundColor = "#f1c40f";
    strengthText.textContent = "Força da senha: boa";
  } else {
    strengthBar.style.width = "100%";
    strengthBar.style.backgroundColor = "#1e7b4b";
    strengthText.textContent = "Força da senha: forte";
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const nomeValido = validarCampo(nome, validarNome);
  const emailValido = validarCampo(email, validarEmail);
  const senhaValida = validarCampo(senha, validarSenha);
  const confirmacaoValida = validarCampo(confirmarSenha, validarConfirmacao);

  if (nomeValido && emailValido && senhaValida && confirmacaoValida) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>Enviando...';
    mensagemSucesso.textContent = "";

    setTimeout(() => {
      mensagemSucesso.textContent = "Cadastro realizado com sucesso!";
      form.reset();

      [nome, email, senha, confirmarSenha].forEach((campo) => {
        campo.classList.remove("error");
        campo.classList.remove("success");
      });

      document.querySelectorAll(".error-msg").forEach((span) => {
        span.textContent = "";
      });

      strengthBar.style.width = "0%";
      strengthBar.style.backgroundColor = "transparent";
      strengthText.textContent = "";

      submitBtn.disabled = false;
      submitBtn.textContent = "Cadastrar";
    }, 2000);
  } else {
    mensagemSucesso.textContent = "";
  }
});