delimiter //

create trigger atualizar_total_ingressos
after insert on ingresso_compra
for each row
begin
	declare evento_id int;

	select fk_id_evento into evento_id
	from ingresso
	where id_ingresso = new.fk_id_ingresso;
	
if exists (select 1 from resumo_evento where id_evento = evento_id) then
	update resumo_evento
	set total_ingressos = total_ingressos + new.quantidade
	where id_evento = evento_id;
else
	insert into resumo_evento (id_evento, total_ingressos)
	values (evento_id, new.quantidade);
end if;

end; //

delimiter ;