document.addEventListener("DOMContentLoaded", function () {
    const jobsContainer = document.getElementById("jobs-container");
    const logoff = document.getElementById("logoff");
    const addJob = document.getElementById("add-job");
    const jobsTable = document.getElementById("jobs-table");
    const message = document.getElementById("message");

    jobsContainer.addEventListener("click", async (e) => {
      if (e.target.nodeName === "BUTTON") {

        if (e.target === addJob) {
          window.location.href = "/jobs/addJobForm";

        } else if (e.target === logoff) {
          await fetch("/sessions/logoff", { method: "POST" });
          window.location.href = "/";

        } else if (e.target.classList.contains("editButton")) {
          const jobId = e.target.dataset.id;
          await fetch(`/jobs/${jobId}`, { method: "PATCH" });
          window.location.href = "/jobs/";

        } else if (e.target.classList.contains("deleteButton")) {
          const jobId = e.target.dataset.id;
          message.textContent = "Deleting...";

          try {
            const response = await fetch(`/jobs/${jobId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            });

            const data = await response.json();

            if (response.status === 200) {
              message.textContent = "The job entry was deleted.";
              const jobElement = document.querySelector(`[data-job-id="${jobId}"]`);
              if (jobElement) {
                jobElement.remove();
              }
            } else {
              message.textContent = data.msg;
            }
          } catch (err) {
            console.error(err);
            message.textContent = "A communication error occurred.";
          }
        }
      }
    });
  });