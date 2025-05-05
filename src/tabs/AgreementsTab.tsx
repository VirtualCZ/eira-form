import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "@/schemas/formSchema";
import FormCheckbox from "@/customComponents/FormCheckbox";

interface AgreementsTabProps {
    control: Control<FormData>
}

export const AgreementsTab = ({ control }: AgreementsTabProps) => {
    const { t } = useTranslation();

    return (
        <>
            <Textarea readOnly className='flex-1'
                value="Prohlašuji a níže svým podpisem potvrzuji a níže svým podpisem potvrzuji, že:
    a) veškeré shora uvedené údaje jsou pravdivé;
    
    b) nejsem v úpadku a není proti mně vedeno exekuční řízení, řízení o výkon rozhodnutí ani insolvenční řízení a mé příjmy z dosavadního pracovněprávního vztahu nebyly a neměly a nemají být postihovány srážkami ze mzdy, a to ani v rámci výkonu rozhodnutí (exekuce) nařízeného soudem, soudním exekutorem, správcem daně, orgánem správního úřadu, jiným státním orgánem nebo orgánem územního správního celku, ani na základě dohody o srážkách ze mzdy uzavřené s třetí osobou (v případě, že by mé příjmy z dosavadního pracovněprávního vztahu byly či měly být postihovány srážkami ze mzdy, zavazuji se to zaměstnavateli oznámit a předložit mu rozhodnutí, případně dohodu o srážkách ze mzdy, na jejichž základě byly či měly být tyto srážky ze mzdy prováděny);
    
    c) mi není známo, že by mé příjmy z pracovněprávního vztahu k současnému zaměstnavateli byly či měly být postihovány srážkami ze mzdy v rámci výkonu rozhodnutí (exekuce) nařízeného soudem, soudním exekutorem, správcem daně, orgánem správního úřadu, jiným státním orgánem nebo orgánem územního správního celku, či na základě dohody o srážkách ze mzdy, uzavřené s třetí osobou (v případě, že by mé příjmy z pracovněprávního vztahu k současnému zaměstnavateli byly či kdykoliv v budoucnu měly být postihovány srážkami ze mzdy, zavazuji se to zaměstnavateli oznámit a předložit mu rozhodnutí, případně dohodu o srážkách ze mzdy, na jejichž základě by měly být tyto srážky ze mzdy prováděny);
    
    jsem žádné významné okolnosti nezamlčel a že údaje zde uvedené jsou úplné a pravdivé k uvedenému datu, přičemž beru na vědomí, že pokud by v době trvání mého pracovněprávního vztahu k zaměstnavateli nastaly změny týkající se uvedených údajů, jsem povinen je neprodleně nahlásit zaměstnavateli, nejpozději však do 8 dnů od jejich vzniku." />
            <FormCheckbox
                name="confirmationReadEmployeeDeclaration"
                formLabel={t('form.labels.confirmationReadEmployeeDeclaration')}
                formControl={control}
            />
            <Textarea readOnly
                className='flex-1'
                value="Ve vztahu k mé shora uvedené elektronické adrese (e-mailové adrese) prohlašuji a níže svým podpisem potvrzuji, že:
    a) jde o mou soukromou e-mailovou adresu, která není v dispozici zaměstnavatele;
    
    b) jde o mou soukromou e-mailovou adresu, kterou mám zájem užívat ke komunikaci se zaměstnavatelem a kterou mám v odpovídající míře zabezpečenu a pravidelně (zpravidla denně) k ní přistupuji;

    c) tuto svou e-mailovou adresu poskytuji zaměstnavateli dobrovolně pro účely mimo jiné zasílání písemností dle § 21 odst. 1 zákoníku práce, mezi něž se řadí pracovní smlouva, dohoda o provedení práce, dohoda o pracovní činnosti nebo jejich změny, dohoda o rozvázání pracovního poměru, dohoda o zrušení právního vztahu založeného dohodou o provedení práce nebo dohodou o pracovní činnosti, budou-li tyto písemnosti uzavírány prostřednictvím sítě/služby elektronických komunikací;

    d) souhlasím s tím, aby mi i veškeré další písemnosti a veškeré informace související s mým pracovněprávním vztahem k zaměstnavateli, na které se případně nevztahují zvláštní podmínky doručování (zejména obsažené v zákoníku práce), byly doručovány prostřednictvím sítě/služby elektronických komunikací na mou shora uvedenou e-mailovou adresu (případně též prostřednictvím mé datové schránky);

v případě změny mé soukromé e-mailové adresy se zavazuji tuto změnu zaměstnavateli bez zbytečného odkladu písemně oznámit." />
            <FormCheckbox
                name="confirmationReadEmailAddressDeclaration"
                formLabel={t('form.labels.confirmationReadEmailAddressDeclaration')}
                formControl={control}
            />
        </>
    );
};