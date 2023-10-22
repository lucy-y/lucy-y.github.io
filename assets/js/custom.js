$(document).ready(function() {
    profile.init();
});

var profile = {
    init: function(){
        const moveTopBtn = document.querySelector(".scroll-to-top");
        moveTopBtn.addEventListener("click", scrollToTop);

        window.addEventListener('scroll', function() {
            let button = document.querySelector('.scroll-to-top');
            if (window.scrollY > 120) { // 스크롤 위치가 100px 이상일 때 버튼 표시
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
        profile.get();
    },
    get: function(){
        fetch('assets/json/profile.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            profile.setGithub(data.github);
            profile.setProject(data.company);
        })
        .catch(error => {
            console.error('파일 로드 중 오류 발생:', error);
        });
    },
    setGithub: function(url){
        const github = document.getElementById("github");
        let link = document.createElement("a");
        link.textContent = "Github";
        link.href = url;
        link.target="_blank";
        link.style="color: #ffffff";
        github.appendChild(link);
    },
    setProject(projects){
        const projectDiv = document.getElementById("projectDiv");
        let companyDiv = document.createElement("div");
        let html = "<ol>";
        projects.forEach(f=>{
            let company = f.name;
            html += "<li>"
            html += company;
            html += "<ul>";
            f.project.forEach(p=>{
                html += "<li>";
                html += p.name;
                html += "</li>"
            })
            html += "</ul>";
            html += "</li>"
            
        })
        html += "</ol>"
        companyDiv.innerHTML = html;
        projectDiv.appendChild(companyDiv);
    }
}

function scrollToTop() {
    $(window).scrollTop(0);
}