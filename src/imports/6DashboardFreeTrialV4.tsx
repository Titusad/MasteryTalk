import svgPaths from "./svg-4qd667nobf";

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

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M6.66667 1.66667V5" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 1.66667V5" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1da67b80} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 8.33333H17.5" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20px] opacity-90 relative shrink-0 w-[132.625px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-white top-0 tracking-[0.1996px] uppercase">Prueba gratuita</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[12px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon />
      <Text1 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Light',sans-serif] font-light leading-[0] left-[0.5px] not-italic text-[0px] text-[24px] text-white top-0 tracking-[0.0703px] w-[125px] whitespace-pre-wrap">
        <span className="leading-[32px]">{`Día `}</span>
        <span className="font-['Inter:Medium',sans-serif] font-medium leading-[32px]">5</span>
        <span className="leading-[32px]">{` de 7`}</span>
      </p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] opacity-75 relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-white top-0 tracking-[-0.1504px]">2 días restantes · No dejes pasar tus oportunidades profesionales. Activa tu suscripción con 15% de descuento.</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[88px] relative shrink-0 w-[345.734px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Container7 />
        <Paragraph />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-white h-[48px] relative rounded-[33554400px] shrink-0 w-[146.078px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[73.5px] not-italic text-[#0f172b] text-[16px] text-center top-[12px] tracking-[-0.3125px]">Activar ahora</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex h-[88px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Link />
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-gradient-to-r from-[#0f172b] h-[152px] relative rounded-[16px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 to-[#1d293d] w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pt-[32px] px-[32px] relative size-full">
        <Container5 />
      </div>
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

function Paragraph2() {
  return (
    <div className="absolute h-[28px] left-0 top-[64px] w-[768px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#45556c] text-[20px] top-0 tracking-[-0.4492px]">Elige un escenario y comienza a entrenar tu comunicación profesional.</p>
    </div>
  );
}

function Icon1() {
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

function Link1() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[190.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[194.936px]" data-name="Link">
      <Icon1 />
      <Dashboard1 />
    </div>
  );
}

function Icon2() {
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

function Link2() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[1.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[165.05px]" data-name="Link">
      <Icon2 />
      <Dashboard2 />
    </div>
  );
}

function Icon3() {
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

function Link3() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[409.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[137.881px]" data-name="Link">
      <Icon3 />
      <Dashboard3 />
    </div>
  );
}

function Icon4() {
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

function Link4() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[571.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[153.503px]" data-name="Link">
      <Icon4 />
      <Dashboard4 />
    </div>
  );
}

function Icon5() {
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

function Link5() {
  return (
    <div className="absolute bg-[#0f172b] h-[46.187px] left-[748.5px] rounded-[22790750px] shadow-[0px_6.792px_10.188px_0px_rgba(0,0,0,0.1),0px_2.717px_4.075px_0px_rgba(0,0,0,0.1)] top-[259px] w-[191.539px]" data-name="Link">
      <Icon5 />
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

function Container10() {
  return (
    <div className="absolute h-[68px] left-[-2.5px] top-[117px] w-[768px]" data-name="Container">
      <UrlInput />
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[315px] relative shrink-0 w-[1375px]" data-name="Container">
      <Heading />
      <Paragraph2 />
      <Link1 />
      <Link2 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[1.5px] not-italic text-[#45556c] text-[14px] top-[222px] tracking-[-0.1504px]">o elige una de las siguientes opciones</p>
      <Link3 />
      <Link4 />
      <Link5 />
      <Container10 />
    </div>
  );
}

function Frame() {
  return <div className="h-[68px] shrink-0 w-[282px]" />;
}

function Container8() {
  return (
    <div className="bg-white h-[394px] relative rounded-[24px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="content-stretch flex flex-col gap-[26px] items-start pb-px pl-[49px] pr-[655px] pt-[49px] relative size-full">
        <Container9 />
        <Frame />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[-0.34px] size-[20px] top-[4px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_15_1947)" id="Icon">
          <path d={svgPaths.p2c2b2c00} id="Vector" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M16.6667 2.5V5.83333" id="Vector_2" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M18.3333 4.16667H15" id="Vector_3" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M3.33333 14.1667V15.8333" id="Vector_4" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M4.16667 15H2.5" id="Vector_5" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_15_1947">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[32px] relative shrink-0 w-[140.719px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[31.5px] not-italic text-[#0f172b] text-[24px] top-[-1px] tracking-[0.0703px]">Power Phrases Bank</p>
        <Icon6 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[62.969px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[-59.69px] not-italic text-[#45556c] text-[14px] text-center top-0 tracking-[-0.1504px]">Frases listas para practicar hoy (6)</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Button1 />
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[12px] top-[4px] w-[89.063px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#314158] text-[12px]">Presentaciones</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#f1f5f9] h-[24px] relative rounded-[33554400px] shrink-0 w-[113.063px]" data-name="Container">
      <Text2 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p19cded00} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2ed10d00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1e708580} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[36px] relative rounded-[10px] shrink-0 w-[54px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-end relative shrink-0 w-[176px]" data-name="Container">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#45556c] text-[14px] tracking-[-0.1504px]">Repaso rápido</p>
      <Button2 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <Container18 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[32.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32.5px] left-[0.5px] not-italic text-[#0f172b] text-[20px] top-[-1px] tracking-[-0.4492px] w-[920px] whitespace-pre-wrap">{`"Let me walk you through the key takeaways"`}</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[546px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Para introducir puntos principales</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[9px] items-end relative shrink-0 w-full" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] tracking-[0.3px] uppercase">Cuándo usar</p>
      <Paragraph4 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[546px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Al iniciar o resumir una presentación</p>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex gap-[9px] items-center relative shrink-0 w-full" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] tracking-[0.3px] uppercase w-[91px] whitespace-pre-wrap">Situación</p>
      <Paragraph5 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[57px] items-start relative shrink-0 w-full" data-name="Container">
      <Container20 />
      <Container21 />
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[16px] w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[16px] px-[25px] relative size-full">
        <Container16 />
        <Paragraph3 />
        <Container19 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col h-[200px] items-start relative shrink-0 w-full" data-name="Container">
      <Container15 />
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[12px] top-[4px] w-[89.063px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#314158] text-[12px]">Presentaciones</p>
    </div>
  );
}

function Container25() {
  return (
    <div className="bg-[#f1f5f9] h-[24px] relative rounded-[33554400px] shrink-0 w-[113.063px]" data-name="Container">
      <Text3 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p19cded00} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2ed10d00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1e708580} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[36px] relative rounded-[10px] shrink-0 w-[54px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-end relative shrink-0 w-[176px]" data-name="Container">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#45556c] text-[14px] tracking-[-0.1504px]">Repaso rápido</p>
      <Button3 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[32.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32.5px] left-[0.5px] not-italic text-[#0f172b] text-[20px] top-[-1px] tracking-[-0.4492px] w-[920px] whitespace-pre-wrap">{`"Let me walk you through the key takeaways"`}</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[20px] relative shrink-0 w-[546px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Para introducir puntos principales</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex gap-[9px] items-end relative shrink-0 w-full" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] tracking-[0.3px] uppercase">Cuándo usar</p>
      <Paragraph7 />
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[20px] relative shrink-0 w-[546px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Al iniciar o resumir una presentación</p>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex gap-[9px] items-center relative shrink-0 w-full" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] tracking-[0.3px] uppercase w-[91px] whitespace-pre-wrap">Situación</p>
      <Paragraph8 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[57px] items-start relative shrink-0 w-full" data-name="Container">
      <Container28 />
      <Container29 />
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[16px] w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[16px] px-[25px] relative size-full">
        <Container24 />
        <Paragraph6 />
        <Container27 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col h-[200px] items-start relative shrink-0 w-full" data-name="Container">
      <Container23 />
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start left-[12px] top-[4px] w-[89.063px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#314158] text-[12px]">Presentaciones</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-[#f1f5f9] h-[24px] relative rounded-[33554400px] shrink-0 w-[113.063px]" data-name="Container">
      <Text4 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p19cded00} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2ed10d00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1e708580} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[36px] relative rounded-[10px] shrink-0 w-[54px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center justify-end relative shrink-0 w-[176px]" data-name="Container">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#45556c] text-[14px] tracking-[-0.1504px]">Repaso rápido</p>
      <Button4 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Container34 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[32.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32.5px] left-[0.5px] not-italic text-[#0f172b] text-[20px] top-[-1px] tracking-[-0.4492px] w-[920px] whitespace-pre-wrap">{`"Let me walk you through the key takeaways"`}</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[20px] relative shrink-0 w-[546px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Para introducir puntos principales</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex gap-[9px] items-end relative shrink-0 w-full" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] tracking-[0.3px] uppercase">Cuándo usar</p>
      <Paragraph10 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[20px] relative shrink-0 w-[546px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Al iniciar o resumir una presentación</p>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex gap-[9px] items-center relative shrink-0 w-full" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] tracking-[0.3px] uppercase w-[91px] whitespace-pre-wrap">Situación</p>
      <Paragraph11 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[57px] items-start relative shrink-0 w-full" data-name="Container">
      <Container36 />
      <Container37 />
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[16px] w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[16px] px-[25px] relative size-full">
        <Container32 />
        <Paragraph9 />
        <Container35 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col h-[200px] items-start relative shrink-0 w-full" data-name="Container">
      <Container31 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[532px] items-start left-0 top-0 w-[970.656px]" data-name="Container">
      <Container13 />
      <Container14 />
      <Container22 />
      <Container30 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_15_1963)" id="Icon">
          <path d={svgPaths.p2c2b2c00} id="Vector" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M16.6667 2.5V5.83333" id="Vector_2" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M18.3333 4.16667H15" id="Vector_3" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M3.33333 14.1667V15.8333" id="Vector_4" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M4.16667 15H2.5" id="Vector_5" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_15_1963">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[28px] relative shrink-0 w-[121.703px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">Practicas Anterior</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex gap-[8px] h-[28px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon10 />
      <Heading2 />
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px] w-[373px] whitespace-pre-wrap">Frases clave que aumentan tu impacto en conversaciones profesionales.</p>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">Sales pitch: Producto B2B</p>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M5.33333 1.33333V4" id="Vector" stroke="var(--stroke-0, #62748E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 1.33333V4" id="Vector_2" stroke="var(--stroke-0, #62748E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3ee34580} id="Vector_3" stroke="var(--stroke-0, #62748E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 6.66667H14" id="Vector_4" stroke="var(--stroke-0, #62748E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text6() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#62748e] text-[14px] top-0 tracking-[-0.1504px]">6 feb 2026</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[20px] items-center left-0 top-[2px] w-[94.656px]" data-name="Text">
      <Icon11 />
      <Text6 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="absolute left-0 size-[16px] top-[2px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_15_1981)" id="Icon">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #62748E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 4V8L10.6667 9.33333" id="Vector_2" stroke="var(--stroke-0, #62748E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_15_1981">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute h-[20px] left-[110.66px] top-[2px] w-[64.766px]" data-name="Text">
      <Icon12 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[22px] not-italic text-[#62748e] text-[14px] top-0 tracking-[-0.1504px]">12 min</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="absolute bg-[#f1f5f9] content-stretch flex h-[24px] items-start left-[191.42px] px-[10px] py-[4px] rounded-[33554400px] top-0 w-[131.75px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px]">{`Sales & negotiation`}</p>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
      <Text5 />
      <Text7 />
      <Text8 />
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[60px] items-start left-0 top-0 w-[884.656px]" data-name="Container">
      <Heading3 />
      <Container43 />
    </div>
  );
}

function Icon13() {
  return (
    <div className="absolute left-[900.66px] size-[20px] top-[4px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute h-[60px] left-[25px] top-[25px] w-[920.656px]" data-name="Container">
      <Container42 />
      <Icon13 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white h-[110px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container41 />
    </div>
  );
}

function Container39() {
  return (
    <div className="bg-white h-[263px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Container40 />
        <Paragraph12 />
        <Button5 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">Tu progreso</p>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[20px] relative shrink-0 w-[81.828px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px]">Esta semana</p>
      </div>
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[28px] relative shrink-0 w-[11.375px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">4</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex h-[28px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text9 />
      <Text10 />
    </div>
  );
}

function Container49() {
  return <div className="bg-[#0f172b] h-[8px] rounded-[33554400px] shrink-0 w-full" data-name="Container" />;
}

function Container48() {
  return (
    <div className="bg-[#f1f5f9] h-[8px] relative rounded-[33554400px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pr-[180.328px] relative size-full">
          <Container49 />
        </div>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[44px] items-start relative shrink-0 w-full" data-name="Container">
      <Container47 />
      <Container48 />
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[20px] relative shrink-0 w-[80.938px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px]">Confidence Score</p>
      </div>
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[28px] relative shrink-0 w-[55.422px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">70/100</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex h-[28px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text11 />
      <Text12 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[88px] items-start relative shrink-0 w-full" data-name="Container">
      <Container46 />
      <Container50 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="absolute left-[275.91px] size-[16px] top-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6 12L10 8L6 4" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Link6() {
  return (
    <div className="bg-[#0f172b] h-[44px] relative rounded-[50px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[127.42px] not-italic text-[14px] text-white top-[12px] tracking-[-0.1504px]">Ver análisis completo</p>
      <Icon14 />
    </div>
  );
}

function Container44() {
  return (
    <div className="bg-white h-[246px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Heading4 />
        <Container45 />
        <Link6 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[532px] items-start left-[1002.66px] top-0 w-[469.344px]" data-name="Container">
      <Container39 />
      <Container44 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[532px] relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container38 />
    </div>
  );
}

function MainContent() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[48px] h-[1182px] items-start left-[169.5px] pt-[48px] px-[32px] top-[81px] w-[1536px]" data-name="Main Content">
      <Container4 />
      <Container8 />
      <Container11 />
    </div>
  );
}

function Dashboard() {
  return (
    <div className="bg-[#f8fafc] h-[1528px] relative shrink-0 w-full" data-name="Dashboard">
      <Header />
      <MainContent />
    </div>
  );
}

export default function Component6DashboardFreeTrialV() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="6. Dashboard - Free Trial v4">
      <Dashboard />
    </div>
  );
}