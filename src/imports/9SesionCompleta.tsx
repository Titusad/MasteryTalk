import svgPaths from "./svg-nt10j428z4";

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

function Link() {
  return (
    <div className="h-[24px] relative shrink-0 w-[143.281px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#45556c] text-[16px] top-0 tracking-[-0.3125px]">Volver al dashboard</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[80px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Link />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex flex-col h-[81px] items-start left-0 pb-px px-[201.5px] top-0 w-[1875px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[16px] size-[32px] top-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Icon">
          <path d={svgPaths.p1dee4500} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          <path d={svgPaths.pde53700} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[#dcfce7] left-[448px] rounded-[33554400px] size-[64px] top-0" data-name="Container">
      <Icon />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[48px] left-0 top-[88px] w-[960px]" data-name="Heading 1">
      <p className="-translate-x-1/2 absolute font-['Inter:Light',sans-serif] font-light leading-[48px] left-[480.22px] not-italic text-[#0f172b] text-[48px] text-center top-px tracking-[-0.8484px]">Sesión completada</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[28px] left-0 top-[152px] w-[960px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[479.91px] not-italic text-[#45556c] text-[20px] text-center top-0 tracking-[-0.4492px]">12 minutos · Sales pitch con Client</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[180px] left-[32px] top-[48px] w-[960px]" data-name="Container">
      <Container3 />
      <Heading />
      <Paragraph />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p13253c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M16 7H22V13" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[#00c950] relative rounded-[14px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[36px] relative shrink-0 w-[264.375px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Light',sans-serif] font-light leading-[36px] not-italic relative shrink-0 text-[#0f172b] text-[30px] tracking-[0.3955px]">Lo que funcionó bien</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[12px] h-[40px] items-center relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Heading1 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">Apertura clara y directa</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[78px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#314158] text-[16px] top-0 tracking-[-0.3125px] w-[242px] whitespace-pre-wrap">Comenzaste con el beneficio principal sin rodeos. Esto capturó la atención inmediatamente.</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-[#f0fdf4] col-1 justify-self-stretch relative rounded-[16px] row-1 self-stretch shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#b9f8cf] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[12px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Heading2 />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">Manejo de objeciones</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[104px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#314158] text-[16px] top-0 tracking-[-0.3125px] w-[245px] whitespace-pre-wrap">Cuando preguntaron sobre el precio, no te pusistes a la defensiva. Reposicionaste el valor antes de mencionar el costo.</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[#f0fdf4] col-2 justify-self-stretch relative rounded-[16px] row-1 self-stretch shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#b9f8cf] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[12px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Heading3 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">Confianza vocal</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[78px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#314158] text-[16px] top-0 tracking-[-0.3125px] w-[254px] whitespace-pre-wrap">Tu ritmo fue pausado y tu volumen constante. Esto proyecta autoridad y preparación.</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#f0fdf4] col-3 justify-self-stretch relative rounded-[16px] row-1 self-stretch shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#b9f8cf] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[12px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Heading4 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[repeat(1,minmax(0,1fr))] h-[194px] relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] h-[266px] items-start left-[32px] top-[292px] w-[960px]" data-name="Container">
      <Container5 />
      <Container7 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.pace200} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3c6311f0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3d728000} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[#0f172b] relative rounded-[14px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[36px] relative shrink-0 w-[338.344px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Light',sans-serif] font-light leading-[36px] not-italic relative shrink-0 text-[#0f172b] text-[30px] tracking-[0.3955px]">Oportunidades de impacto</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[12px] h-[40px] items-center relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Heading5 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p1ea91d80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M9 18H15" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M10 22H14" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#0f172b] relative rounded-[14px] shrink-0 size-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[342.922px]" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[20px] top-0 tracking-[-0.4492px]">Estructura la objeción con frameworks</p>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute bg-[#0f172b] content-stretch flex h-[24px] items-start left-[354.92px] px-[12px] py-[4px] rounded-[33554400px] top-[2px] w-[97.172px]" data-name="Text">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">Alto impacto</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <Heading6 />
      <Text />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[58.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-0 not-italic text-[#314158] text-[18px] top-px tracking-[-0.4395px] w-[809px] whitespace-pre-wrap">{`Al responder dudas sobre implementación, podrías usar: 'Great question. Let me break this into three parts: timeline, resources, and support.' Esto da control y claridad.`}</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="flex-[1_0_0] h-[98.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative size-full">
        <Container19 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex gap-[24px] h-[98.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-[#f8fafc] h-[164.5px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-px pt-[33px] px-[33px] relative size-full">
        <Container16 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p1ea91d80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M9 18H15" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M10 22H14" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[#0f172b] relative rounded-[14px] shrink-0 size-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[417.875px]" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[20px] top-0 tracking-[-0.4492px]">Cierra cada sección con un micro-compromiso</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <Heading7 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[58.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-0 not-italic text-[#314158] text-[18px] top-px tracking-[-0.4395px] w-[794px] whitespace-pre-wrap">{`Después de explicar un beneficio, pregunta: 'Does this align with what you're looking for?' o 'Would this solve your current challenge?' Mantiene al cliente comprometido.`}</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="flex-[1_0_0] h-[98.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative size-full">
        <Container24 />
        <Paragraph5 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex gap-[24px] h-[98.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container22 />
      <Container23 />
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-[#f8fafc] h-[164.5px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-px pt-[33px] px-[33px] relative size-full">
        <Container21 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[353px] items-start relative shrink-0 w-full" data-name="Container">
      <Container15 />
      <Container20 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] h-[425px] items-start left-[32px] top-[622px] w-[960px]" data-name="Container">
      <Container12 />
      <Container14 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-0 size-[24px] top-[4px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.pb47f400} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p17a13100} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M10 9H8" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M16 13H8" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M16 17H8" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Heading8() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[20px] text-white top-0 tracking-[-0.4492px]">Tu guión optimizado está listo</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[52px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#cad5e2] text-[16px] top-0 tracking-[-0.3125px] w-[812px] whitespace-pre-wrap">Hemos reorganizado tu respuesta usando las técnicas de comunicación más efectivas. Úsalo como base para tu próxima conversación real.</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[88px] items-start left-[40px] top-0 w-[856px]" data-name="Container">
      <Heading8 />
      <Paragraph6 />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[88px] relative shrink-0 w-full" data-name="Container">
      <Icon5 />
      <Container27 />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col h-[152px] items-start left-[32px] pt-[32px] px-[32px] rounded-[16px] top-[1111px] w-[960px]" data-name="Container" style={{ backgroundImage: "linear-gradient(171.003deg, rgb(15, 23, 43) 0%, rgb(29, 41, 61) 100%)" }}>
      <Container26 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3713e00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pd2076c0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M8.33333 7.5H6.66667" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 10.8333H6.66667" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 14.1667H6.66667" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[174.203px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[87.5px] not-italic text-[20px] text-center text-white top-0 tracking-[-0.4492px]">Ver guión mejorado</p>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M4.16667 10H15.8333" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1ae0b780} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#0f172b] h-[72px] relative rounded-[33554400px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 w-[318.203px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center justify-center relative size-full">
        <Icon6 />
        <Text1 />
        <Icon7 />
      </div>
    </div>
  );
}

function Feedback() {
  return (
    <div className="h-[28px] relative shrink-0 w-[131.391px]" data-name="Feedback">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#0f172b] text-[20px] top-0 tracking-[-0.4492px]">Nueva práctica</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="h-[72px] relative rounded-[33554400px] shrink-0 w-[215.391px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[33554400px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2px] relative size-full">
        <Feedback />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[72px] items-start justify-center left-[32px] top-[1311px] w-[960px]" data-name="Container">
      <Button />
      <Link1 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[28px] left-[32px] top-[1431px] w-[960px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[480.77px] not-italic text-[#45556c] text-[18px] text-center top-0 tracking-[-0.4395px]">Cada sesión te acerca a dominar conversaciones de alto impacto</p>
    </div>
  );
}

function MainContent() {
  return (
    <div className="absolute h-[1507px] left-[425.5px] top-[81px] w-[1024px]" data-name="Main Content">
      <Container2 />
      <Container4 />
      <Container11 />
      <Container25 />
      <Container28 />
      <Paragraph7 />
    </div>
  );
}

export default function Component9SesionCompleta() {
  return (
    <div className="bg-white relative size-full" data-name="9. Sesión Completa">
      <Header />
      <MainContent />
    </div>
  );
}