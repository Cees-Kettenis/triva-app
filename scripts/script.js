const APISessionKey = "";
const LocalStorageUserKey = "ckettenisTrivaUserNameKey";
const LocalStorageHighestScore = "ckettenisTrivaHeighestScore";

const sessionToken = "ckettenisTrivalAPISessionTokenKey";
const sessionCatagories = "ckettenisTrivalAPISessionCatagoryKey";
const sessionQuestionsByCatagory = "ckettenisTrivalsessionCatagory";
const currentSelectedCatagory = "ckettenisTrivalcurrentSelectedCatagory";

$(document).ready(function () {
  //no cheeting!
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  $(".confetti").on("click", function () {
    $(this).addClass("none");
  });
  $("html").on("keydown", function (e) {
    if (e.key == "F12") {
      e.preventDefault();
    }
    if (e.key == "u" && e.ctrlKey) {
      e.preventDefault();
    }
  });

  //check for the user name
  if (
    localStorage.getItem(LocalStorageUserKey) == null ||
    localStorage.getItem(LocalStorageUserKey) == ""
  ) {
    $("#get-user-name-mdl").modal("show");
  } else {
    //customized welcome message
    $(".welcome-message").text(
      `Welcome back ${localStorage.getItem(
        LocalStorageUserKey
      )}! Please select a category to begin!`
    );
  }

  //setup the main API logic
  setup();
  //END OF DOCUMENT.READY
});

//--------------------APP FUNCTION ------------------------------------------------//

function saveUserName() {
  localStorage.setItem(LocalStorageUserKey, $(".user-name").val());
  $(".welcome-message").text(
    `Welcome ${localStorage.getItem(
      LocalStorageUserKey
    )}! Please select a category to begin!`
  );
}

function selectCatagory() {
  $(".catagory-container").removeClass("none");
  $(".welcome-message").removeClass("none");
  $(".question-container").addClass("none");
}

function StartTrivia() {
  resetScore();
  getNextQuestion();
  $(".catagory-container").addClass("none");
  $(".welcome-message").addClass("none");
  $(".question-container").removeClass("none");
}

function getNextQuestion() {
  //reset classes on buttons
  $(".awnser").each(function () {
    $(this).removeClass("visible");
    $(this).removeClass("wrong");
    $(this).removeClass("correct");
    $(this).removeClass("none");
  });
  $(".next-question").addClass("none");
  //get random question from catagorylist.
  var questions = JSON.parse(
    sessionStorage.getItem(
      sessionQuestionsByCatagory +
        sessionStorage.getItem(currentSelectedCatagory)
    )
  );
  var question = questions[0];
  questions.shift();

  //if the list has 0 elements call the next questions else save the new questions array
  if (questions.length == 0) {
    sessionStorage.removeItem(
      sessionQuestionsByCatagory +
        sessionStorage.getItem(currentSelectedCatagory)
    );
    getCatagoryQuestions(
      sessionStorage.getItem(currentSelectedCatagory),
      false
    );
  } else {
    sessionStorage.setItem(
      sessionQuestionsByCatagory +
        sessionStorage.getItem(currentSelectedCatagory),
      JSON.stringify(questions)
    );
  }
  //fill in the content
  $(".question").html(question.question);
  if (question.incorrect_answers.length > 1) {
    // we will have 4 awnsers
    var ramdomcorrectawnser = Math.floor(Math.random() * 4);
    $($(".awnser")[ramdomcorrectawnser])
      .addClass("correct")
      .text(question.correct_answer);
    var counter = 0;
    $(".awnser").each(function (index, value) {
      if (index != ramdomcorrectawnser) {
        $(this).addClass("wrong").html(question.incorrect_answers[counter]);
        counter++;
      }
    });
  } else {
    //true or false
    var ramdomcorrectawnser = Math.floor(Math.random() * 2);
    if (ramdomcorrectawnser == 0) {
      $($(".awnser")[0]).addClass("correct").html(question.correct_answer);
      $($(".awnser")[1]).addClass("wrong").html(question.incorrect_answers[0]);
    } else {
      $($(".awnser")[1]).addClass("correct").html(question.correct_answer);
      $($(".awnser")[0]).addClass("wrong").html(question.incorrect_answers[0]);
    }
    $($(".awnser")[2]).addClass("none");
    $($(".awnser")[3]).addClass("none");
  }
}

function revealAwnser(awnser) {
  //update score
  if ($(awnser).hasClass("correct") && !$(awnser).hasClass("visible")) {
    $(".confetti").removeClass("none");
    setTimeout(() => {
      $(".confetti").addClass("none");
    }, 2000);

    $(".correct-score").text(parseInt($(".correct-score").text()) + 1);
    $(".streak-score").text(parseInt($(".streak-score").text()) + 1);
    if (
      parseInt($(".streak-score").text()) >
      parseInt($(".heighest-streak-score").text())
    ) {
      localStorage.setItem(LocalStorageHighestScore, $(".streak-score").text());

      $(".heighest-streak-score").text($(".streak-score").text());
    }
  }

  if ($(awnser).hasClass("wrong") && !$(awnser).hasClass("visible")) {
    $(".wrong-score").text(parseInt($(".wrong-score").text()) + 1);
    $(".streak-score").text(0);
  }
  //reveal awnsers
  $(".awnser").each(function () {
    $(this).addClass("visible");
  });

  //show next question button
  $(".next-question").removeClass("none");
}

function resetScore() {
  $(".correct-score").text("0");
  $(".wrong-score").text("0");
  $(".streak-score").text("0");
  if (
    localStorage.getItem(LocalStorageHighestScore) == null ||
    localStorage.getItem(LocalStorageHighestScore) == ""
  ) {
    $(".heighest-streak-score").text("0");
  } else {
    $(".heighest-streak-score").text(
      localStorage.getItem(LocalStorageHighestScore)
    );
  }
}

//--------------------API FUNCTION ------------------------------------------------//
//the main app setup
function setup() {
  //we want to do a few things.
  //1. get the session token
  //2. get the list of catagories

  //1. get a session token
  if (
    sessionStorage.getItem(sessionToken) == null ||
    sessionStorage.getItem(sessionToken) == ""
  ) {
    $.ajax({
      url: "https://opentdb.com/api_token.php?command=request",
      dataType: "json",
      type: "GET",
      crossDomain: true,
      success: function (ajaxResult) {
        sessionStorage.setItem(sessionToken, ajaxResult.token);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert(errorThrown);
      },
    });
  }

  //3. get catagories and use template to display cachse it out of professinalism
  if (
    sessionStorage.getItem(sessionCatagories) == null ||
    sessionStorage.getItem(sessionCatagories) == ""
  ) {
    $.ajax({
      url: "https://opentdb.com/api_category.php",
      dataType: "json",
      type: "GET",
      crossDomain: true,
      success: function (ajaxResult) {
        sessionStorage.setItem(
          sessionCatagories,
          JSON.stringify(
            ajaxResult.trivia_categories.sort(function (a, b) {
              const nameA = a.name.toUpperCase(); // ignore upper and lowercase
              const nameB = b.name.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }

              // names must be equal
              return 0;
            })
          )
        );
        setupCatagories(ajaxResult.trivia_categories);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert(errorThrown);
      },
    });
  } else {
    var catagories = JSON.parse(sessionStorage.getItem(sessionCatagories));
    setupCatagories(catagories);
  }
}

function setupCatagories(array) {
  $.each(array, function (index, value) {
    var template = document.getElementById("catagory-template");
    var templateClone = template.content.cloneNode(true);
    var div = $(templateClone).find("div")[0];
    $(div)
      .attr("data-id", value.id)
      .attr("onClick", `getCatagoryQuestions(${value.id});`)
      .html(value.name);
    $(".catagory-container").append(div);
  });
}

function getCatagoryQuestions(id, startGame = true) {
  var url = `https://opentdb.com/api.php?category=${id}&Token=${sessionStorage.getItem(
    sessionToken
  )}&amount=10`;

  sessionStorage.setItem(currentSelectedCatagory, id);

  if (
    sessionStorage.getItem(sessionQuestionsByCatagory + id) == null ||
    sessionStorage.getItem(sessionQuestionsByCatagory + id) == ""
  ) {
    $.ajax({
      url: url,
      dataType: "json",
      type: "GET",
      crossDomain: true,
      success: function (ajaxResult) {
        if (ajaxResult.response_code == 0) {
          sessionStorage.setItem(
            sessionQuestionsByCatagory + id,
            JSON.stringify(ajaxResult.results)
          );
          if (startGame) {
            StartTrivia();
          }
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert(errorThrown);
      },
    });
  } else {
    if (startGame) {
      StartTrivia();
    }
  }
}
