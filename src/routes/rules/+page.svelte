<script>
	import { resolve } from '$app/paths';
	import {
		rules_title,
		rules_intro_1,
		rules_intro_2,
		rules_teams_title,
		rules_composition,
		rules_composition_desc,
		rules_coach_note,
		rules_staff_note,
		rules_nationality,
		rules_nationality_desc,
		rules_ranking,
		rules_ranking_desc,
		rules_registration,
		rules_registration_desc
	} from '$lib/paraglide/messages';
</script>

<article>
	<section>
		<h1>{rules_title()}</h1>
		<p>{rules_intro_1()}</p>
		<p>{rules_intro_2()}</p>
	</section>
	<section>
		<h1>{rules_teams_title()}</h1>
		<h2>{rules_composition()}</h2>
		<p>{rules_composition_desc()}</p>
		<p>{rules_coach_note()}</p>
		<p>{rules_staff_note()}</p>
		<h2>{rules_nationality()}</h2>
		<p>{@html rules_nationality_desc()}</p>
		<h2>{rules_ranking()}</h2>
		<p>{rules_ranking_desc()}</p>
		<h2>{rules_registration()}</h2>
		<p>
			{@html rules_registration_desc({
				here: '<b><a href="' + resolve('/register') + '">aqui</a></b>'
			})}
		</p>
	</section>
</article>
