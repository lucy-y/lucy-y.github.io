$(document).ready(function() {
    profile.init();
});

document.addEventListener('DOMContentLoaded', function () {
    let moveTopBtn = document.querySelector(".scroll-to-top");
    moveTopBtn.addEventListener("click", scrollToTop);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 120) {
            moveTopBtn.style.display = 'block';
        } else {
            moveTopBtn.style.display = 'none';
        }
    });
});

var profile = {
    init: function(){
        profile.get();
    },
    get: function(){
        fetch('assets/data/lucy.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            profile.setGithub(data.github);
            profile.setProject(data.projects);

            createGraph(data.company);
            profile.setCompany(data.company);
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
        renderPortpolioData(projects);
    },
    setCompany(company){
        const contentElement = document.getElementById("companiesDiv");
        for (let i = 0; i < company.length; i++) {
            const item = company[i];
            const template = createTemplate(item, i);
            contentElement.appendChild(template);
        }
    }
}

function scrollToTop() {
    let button = document.querySelector('.scroll-to-top');
    button.style.display = "none";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createGraph(data) {
    const graphElement = document.getElementById("graph");
    graphElement.innerHTML = "";

    const lineStart = new Date("2017-01-01");
    const lineEnd = new Date(getFutureDate());
    const lineLength = lineEnd.getTime() - lineStart.getTime();
    const lineLengthByYear = lineEnd.getFullYear() - lineStart.getFullYear() + 1;
    const lineLengthByDays = lineLength / (1000 * 60 * 60 * 24); // 일 수 간격 계산
    const tickWidth = 100 / (lineLengthByDays / 365); // 각 눈금의 너비 (가로로 등간격 배치)

    // 가중치를 적용할 최대 높이 설정
    const maxWeightedHeight = 200;

    // 기간이 긴 영역에 가중치를 적용하여 높이 계산
    const weightedData = data.map((item) => {
        const startDate = new Date(item.start);
        const tempEndDate = item.end == null ? getCurrentDateText() : item.end;
        const endDate = new Date(tempEndDate);

        const duration = endDate.getTime() - startDate.getTime();
        const weight = Math.ceil((duration / lineLength) * maxWeightedHeight);

        return { ...item, weight };
    });

    // 가중치를 기준으로 오름차순 정렬
    weightedData.sort((a, b) => a.weight - b.weight);

    let currentHeight = maxWeightedHeight;

    // 회사별로 색상 지정을 위해 graph.css에서 색상을 추가해줘야 한다.
    for (const item of weightedData) {
        const areaElement = document.createElement("div");
        areaElement.classList.add("area");

        const areaElementNameTag = document.createElement("p");
        areaElementNameTag.textContent = item.title;
        areaElement.appendChild(areaElementNameTag);

        const startDate = new Date(item.start);
        const tempEndDate = item.end == null ? getCurrentDateText() : item.end;
        const endDate = new Date(tempEndDate);

        const startPercentage = ((startDate.getTime() - lineStart.getTime()) / lineLength) * 100;
        const endPercentage = ((endDate.getTime() - lineStart.getTime()) / lineLength) * 100;

        const areaWidth = endPercentage - startPercentage;
        const areaHeight = Math.min(item.weight, currentHeight); // 현재 높이와 비교하여 최대 높이 제한

        areaElement.style.bottom = "0"; // 맨 아래에서 시작하도록 설정
        areaElement.style.left = `${startPercentage}%`;
        areaElement.style.width = `${areaWidth}%`;
        areaElement.style.height = `${areaHeight}px`; // 가중치에 따른 높이 설정

        graphElement.appendChild(areaElement);

        currentHeight -= areaHeight;
    }

    for (let i = 0; i < lineLengthByYear; i++) {
        const year = lineStart.getFullYear() + i;

        // 수직 눈금 생성
        const tickDiv = document.createElement("div");
        tickDiv.classList.add("tick");
        tickDiv.style.left = `${tickWidth * i}%`;
        graphElement.appendChild(tickDiv);

        // 연도 표시 생성
        const yearDiv = document.createElement("div");
        yearDiv.classList.add("year");
        yearDiv.innerText = year.toString();
        yearDiv.style.left = `${tickWidth * i}%`;
        graphElement.appendChild(yearDiv);
    }
}

function getFutureDate() {
    let currentDate = new Date();
    let futureDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

    let year = futureDate.getFullYear();
    let month = (futureDate.getMonth() + 1).toString().padStart(2, "0");
    let day = futureDate.getDate().toString().padStart(2, "0");

    let futureDateText = year + "-" + month + "-" + day;
    return futureDateText;
}

function getCurrentDateText(noDay) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    if (noDay === undefined || !noDay) {
        const day = String(currentDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    } else return `${year}-${month}`;
}

// 템플릿 생성 및 데이터 채워넣기 함수
function createTemplate(data, idx) {
    const template = document.createElement("div");
    template.className = "container";
    addXButton(template, () => {
        careerData.splice(idx, 1);
        const containers = document.getElementsByClassName("container");
        while (containers.length > 0) {
            containers[0].parentNode.removeChild(containers[0]);
        }
        const areas = document.getElementsByClassName("area");
        while (areas.length > 0) {
            areas[0].parentNode.removeChild(areas[0]);
        }
        renderData(careerData);
    });

    const leftSpace = document.createElement("div");
    leftSpace.className = "left-space";

    const image = document.createElement("img");
    image.src = "/assets/"+data.src;

    leftSpace.appendChild(image);
    template.appendChild(leftSpace);

    const rightSpaces = document.createElement("div");
    rightSpaces.className = "right-spaces";

    const rightSpace1 = document.createElement("div");
    rightSpace1.className = "right-space";

    const companyTitle = document.createElement("p");
    companyTitle.className = "company-title";
    companyTitle.textContent = data.title;

    const companyLevel = document.createElement("p");
    companyLevel.className = "company-level";
    companyLevel.textContent = data.level;

    const companyDate = document.createElement("p");
    companyDate.className = "company-date";
    companyDate.textContent = `${formatDate(data.start)} ~ ${formatDate(data.end)} (${calculateYearMonth(data.start, data.end)})`;

    rightSpace1.appendChild(companyTitle);
    rightSpace1.appendChild(companyLevel);
    rightSpace1.appendChild(companyDate);
    rightSpaces.appendChild(rightSpace1);

    const rightSpace2 = document.createElement("div");
    rightSpace2.className = "right-space";

    const companyWork = document.createElement("p");
    companyWork.className = "company-work";
    companyWork.textContent = data.work;

    const companyTag = document.createElement("p");
    companyTag.className = "company-tag";
    companyTag.textContent = data.tags.map((tag) => "#" + upperFirst(tag)).join(" ");

    rightSpace2.appendChild(companyWork);
    rightSpace2.appendChild(companyTag);
    rightSpaces.appendChild(rightSpace2);

    template.appendChild(rightSpaces);

    return template;
}

function addXButton(element, func) {
    const xButton = document.createElement("div");
    xButton.classList.add("x-button");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line1.setAttribute("x1", "18");
    line1.setAttribute("y1", "6");
    line1.setAttribute("x2", "6");
    line1.setAttribute("y2", "18");

    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line2.setAttribute("x1", "6");
    line2.setAttribute("y1", "6");
    line2.setAttribute("x2", "18");
    line2.setAttribute("y2", "18");

    svg.appendChild(line1);
    svg.appendChild(line2);

    xButton.appendChild(svg);
    xButton.addEventListener("click", func);
    element.appendChild(xButton);
}

function formatDate(dateString) {
    const tempDate = dateString == null ? getCurrentDateText() : dateString;
    
    if (tempDate.length === 7) {
        const year = tempDate.substring(0, 4);
        const month = tempDate.substring(5, 7);
        return `${year}년 ${month}월`;
    }

    const date = new Date(tempDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
}

function getFutureDate() {
    let currentDate = new Date();
    let futureDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

    let year = futureDate.getFullYear();
    let month = (futureDate.getMonth() + 1).toString().padStart(2, "0");
    let day = futureDate.getDate().toString().padStart(2, "0");

    let futureDateText = year + "-" + month + "-" + day;
    return futureDateText;
}

function calculateYearMonth(date1, date2) {
    date2 = date2 == null ? getCurrentDateText() : date2;
    
    const [year1, month1] = date1.split("-").map(Number);
    const [year2, month2] = date2.split("-").map(Number);

    const yearDiff = year2 - year1;
    const monthDiff = month2 - month1;

    let yearString = "";
    let monthString = "";

    if (yearDiff > 0) {
        yearString = `${yearDiff}년`;
    } else {
        yearString = `0년`;
    }

    if (monthDiff >= 0) {
        monthString = `${monthDiff}개월`;
    } else {
        yearString = `${yearDiff - 1}년`;
        monthString = `${12 + monthDiff}개월`;
    }

    return `${yearString} ${monthString}`;
}

function upperFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// project
// 데이터를 기반으로 템플릿 생성하여 화면에 추가하기
function renderPortpolioData(data) {
    const contentElement = document.getElementById("projectDiv");

    data.forEach((item, index) => {
        item.index = index + 1; // 인덱스 값 설정
        const template = createPortpolioTemplate(item, index);
        contentElement.appendChild(template);
    });
}

// 템플릿 생성 및 데이터 채워넣기 함수
function createPortpolioTemplate(data, idx) {
    const template = document.createElement("div");
    template.className = "portpolio-wrap";

    addXButton(template, () => {
        portpolioData.splice(idx, 1);

        const ports = document.getElementsByClassName("portpolio-wrap");
        while (ports.length > 0) {
            ports[0].parentNode.removeChild(ports[0]);
        }

        renderPortpolioData(portpolioData);
    });

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "slider-container";
    sliderContainer.classList.add(`slider-container-${data.index}`);

    const slider = document.createElement("div");
    slider.className = "slider";
    slider.classList.add(`slider-${data.index}`);

    data.src.forEach((src) => {
        const slide = document.createElement("div");
        slide.className = "slide";

        const image = document.createElement("img");
        image.src = "/assets/" + src;
        image.width = "376";
        image.height = "228";
        image.alt = "project Image";

        if (data.isHorizontal) image.className = "horizontal";

        slide.appendChild(image);
        slider.appendChild(slide);
    });

    if (data.src.length > 1) {
        const prevButton = document.createElement("div");
        prevButton.className = "prev-button";
        prevButton.classList.add(`prev-button-${data.index}`);
        prevButton.innerHTML = leftSvgHtml;

        const nextButton = document.createElement("div");
        nextButton.className = "next-button";
        nextButton.classList.add(`next-button-${data.index}`);
        nextButton.innerHTML = rightSvgHtml;

        sliderContainer.appendChild(prevButton);
        sliderContainer.appendChild(nextButton);
    }

    sliderContainer.appendChild(slider);

    const projectInfo = document.createElement("div");
    projectInfo.className = "w50 pl10";

    const titleWrap = document.createElement("div");
    titleWrap.className = "project-title-wrap";

    const projectTitle = document.createElement("p");
    projectTitle.className = "project-title";
    projectTitle.textContent = data.title;

    const projectDate = document.createElement("p");
    projectDate.className = "project-date";
    projectDate.textContent = `${formatDate(data.start)} ~ ${formatDate(data.end)}`;

    const projectName = document.createElement("p");
    projectName.className = "project-name";
    projectName.textContent = data.company;

    titleWrap.appendChild(projectTitle);
    titleWrap.appendChild(projectDate);
    titleWrap.appendChild(projectName);

    const projectDesc = document.createElement("div");
    projectDesc.className = "project-desc";
    projectDesc.innerHTML = data.desc;

    const workList = document.createElement("ul");
    workList.className = "bootstrap-list";

    data.work.forEach((work) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${work}`;
        workList.appendChild(listItem);
    });

    const projectTag = document.createElement("p");
    projectTag.className = "project-tag";
    projectTag.textContent = `#${data.tag.join(" #")}`;

    projectInfo.appendChild(titleWrap);
    projectInfo.appendChild(projectDesc);
    projectInfo.appendChild(workList);
    projectInfo.appendChild(projectTag);

    template.appendChild(sliderContainer);
    template.appendChild(projectInfo);

    return template;
}