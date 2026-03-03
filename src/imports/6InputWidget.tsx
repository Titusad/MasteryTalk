function Container1() {
  return (
    <div className="h-[32px] relative shrink-0 w-[145.844px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-0 not-italic text-[#0f172b] text-[0px] text-[24px] top-0 tracking-[-0.5297px] w-[164px] whitespace-pre-wrap">
          <span className="leading-[32px]">{`inFluentia `}</span>
          <span className="font-['Inter:Light',sans-serif] font-light leading-[32px]">PRO</span>
        </p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="flex-[1_0_0] h-[24px] min-h-px min-w-px relative" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[52px] not-italic text-[#45556c] text-[16px] text-center top-0 tracking-[-0.3125px]">Configuración</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20px] relative shrink-0 w-[17.797px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-white top-0 tracking-[-0.1504px]">JD</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[#0f172b] relative rounded-[33554400px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.016px] relative size-full">
        <Text />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[40px] relative shrink-0 w-[168.234px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative size-full">
        <Button />
        <Container3 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[80px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[81px] items-start left-0 pb-px px-[201.5px] top-0 w-[1875px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[48px] left-0 top-0 w-[768px]" data-name="Heading 1">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[48px] left-0 not-italic text-[#0f172b] text-[48px] top-px tracking-[-0.8484px]">¿Qué vas a practicar hoy?</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[28px] left-0 top-[64px] w-[768px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#45556c] text-[20px] top-0 tracking-[-0.4492px]">Elige un escenario y comienza a entrenar tu comunicación profesional.</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[18.68px] size-[16.301px] top-[14.94px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3012 16.3012">
        <g id="Icon">
          <path d="M3.3962 8.15061H12.9053" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
          <path d="M8.15073 3.39608V12.9051" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
        </g>
      </svg>
    </div>
  );
}

function Dashboard1() {
  return (
    <div className="absolute h-[19.018px] left-[43.13px] top-[13.58px] w-[91.387px]" data-name="Dashboard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.018px] left-0 not-italic text-[13.584px] text-white top-0 tracking-[-0.3051px]">Estatus de proyecto</p>
    </div>
  );
}

function Link() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[190.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[194.936px]" data-name="Link">
      <Icon />
      <Dashboard1 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[18.68px] size-[16.301px] top-[14.94px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3012 16.3012">
        <g id="Icon">
          <path d="M3.39587 8.15061H12.9049" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
          <path d="M8.1504 3.39608V12.9051" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
        </g>
      </svg>
    </div>
  );
}

function Dashboard2() {
  return (
    <div className="absolute h-[19.018px] left-[43.13px] top-[13.58px] w-[91.387px]" data-name="Dashboard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.018px] left-0 not-italic text-[13.584px] text-white top-0 tracking-[-0.3051px]">Pitch de ventas</p>
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[1.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[165.05px]" data-name="Link">
      <Icon1 />
      <Dashboard2 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[18.68px] size-[16.301px] top-[14.94px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3012 16.3012">
        <g id="Icon">
          <path d="M3.39637 8.15061H12.9054" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
          <path d="M8.1509 3.39608V12.9051" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
        </g>
      </svg>
    </div>
  );
}

function Dashboard3() {
  return (
    <div className="absolute h-[19.018px] left-[43.13px] top-[13.58px] w-[91.387px]" data-name="Dashboard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.018px] left-0 not-italic text-[13.584px] text-white top-0 tracking-[-0.3051px]">Entrevista</p>
    </div>
  );
}

function Link2() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[409.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[137.881px]" data-name="Link">
      <Icon2 />
      <Dashboard3 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[18.68px] size-[16.301px] top-[14.94px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3012 16.3012">
        <g id="Icon">
          <path d="M3.39595 8.15061H12.905" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
          <path d="M8.15048 3.39608V12.9051" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
        </g>
      </svg>
    </div>
  );
}

function Dashboard4() {
  return (
    <div className="absolute border-[0.679px] border-black border-solid h-[19.018px] left-[43.13px] top-[13.58px] w-[91.387px]" data-name="Dashboard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.018px] left-[-0.68px] not-italic text-[13.584px] text-white top-[-0.68px] tracking-[-0.3051px]">Presentación</p>
    </div>
  );
}

function Link3() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[571.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[153.503px]" data-name="Link">
      <Icon3 />
      <Dashboard4 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[18.68px] size-[16.301px] top-[14.94px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3012 16.3012">
        <g id="Icon">
          <path d="M3.39645 8.15061H12.9055" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
          <path d="M8.15097 3.39608V12.9051" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.69804" />
        </g>
      </svg>
    </div>
  );
}

function Dashboard5() {
  return (
    <div className="absolute h-[19.018px] left-[43.13px] top-[13.58px] w-[91.387px]" data-name="Dashboard">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.018px] left-0 not-italic text-[13.584px] text-white top-0 tracking-[-0.3051px]">Negociación</p>
    </div>
  );
}

function Link4() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[748.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[191.539px]" data-name="Link">
      <Icon4 />
      <Dashboard5 />
    </div>
  );
}

function UrlInput() {
  return (
    <div className="absolute bg-[#f8fafc] h-[68px] left-0 rounded-[16px] top-0 w-[1385px]" data-name="URL Input">
      <div className="content-stretch flex items-center overflow-clip px-[24px] py-[20px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#90a1b9] text-[16px] tracking-[-0.3125px]">Ej: Tengo una reunión para revisar el presupuesto...</p>
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[68px] left-[-2.5px] top-[117px] w-[768px]" data-name="Container">
      <UrlInput />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[315px] relative shrink-0 w-[1375px]" data-name="Container">
      <Heading />
      <Paragraph />
      <Link />
      <Link1 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[1.5px] not-italic text-[#45556c] text-[14px] top-[222px] tracking-[-0.1504px]">o elige una de las siguientes opciones</p>
      <Link2 />
      <Link3 />
      <Link4 />
      <Container6 />
    </div>
  );
}

function Frame() {
  return <div className="h-[68px] shrink-0 w-[282px]" />;
}

function Container4() {
  return (
    <div className="bg-white h-[394px] relative rounded-[24px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="content-stretch flex flex-col gap-[26px] items-start pb-px pl-[49px] pr-[655px] pt-[49px] relative size-full">
        <Container5 />
        <Frame />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="absolute content-stretch flex flex-col h-[475px] items-start left-[169px] pt-[48px] px-[32px] top-[81px] w-[1537px]" data-name="Main Content">
      <Container4 />
    </div>
  );
}

function Dashboard() {
  return (
    <div className="bg-[#f8fafc] h-[620px] relative shrink-0 w-[1875px]" data-name="Dashboard">
      <Header />
      <MainContent />
    </div>
  );
}

export default function Component6InputWidget() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="6. Input widget">
      <Dashboard />
    </div>
  );
}