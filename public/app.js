document.addEventListener('DOMContentLoaded', () => {
    
    // Tab Switching Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Discovery Logic
    const btnDiscover = document.getElementById('btn-discover');
    if (btnDiscover) {
        btnDiscover.addEventListener('click', async () => {
            const skills = document.getElementById('discover-skills').value.split(',').map(s=>s.trim());
            const interests = document.getElementById('discover-interests').value.split(',').map(s=>s.trim());
            
            const loading = document.getElementById('discover-loading');
            const resultsDiv = document.getElementById('discover-results');
            
            loading.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
            resultsDiv.innerHTML = '';
            btnDiscover.disabled = true;

            try {
                const res = await fetch('/api/discover', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ skills, interests, availability_days: 30 })
                });
                const json = await res.json();
                
                if (json.success && json.data.recommendations) {
                    json.data.recommendations.forEach(rec => {
                        const card = document.createElement('div');
                        card.className = 'result-card glass';
                        const h = rec.hackathon;
                        card.innerHTML = `
                            <h3>#${rec.rank} ${h.name}</h3>
                            <p><strong>Platform:</strong> <span class="badge platform">${h.platform || 'Unknown'}</span> | <strong>Theme:</strong> <span class="badge theme">${h.theme || 'Open'}</span></p>
                            <p><strong>Prize:</strong> ${h.prize_pool || 'N/A'} | <strong>Deadline:</strong> ${h.deadline ? new Date(h.deadline).toLocaleString() : 'N/A'}</p>
                            <p style="margin: 0.5rem 0; color: var(--text-secondary);">${h.description || 'No description provided.'}</p>
                            <p><strong>Reason:</strong> ${rec.recommendation_reason}</p>
                            <div class="badges">
                                ${rec.suggested_tech_stack ? rec.suggested_tech_stack.map(t => `<span class="badge tech">${t}</span>`).join('') : ''}
                            </div>
                            
                            <!-- Problem Statement Toggle -->
                            <div style="margin-top: 1rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                                <button class="btn" style="background: rgba(255,255,255,0.1); width: 100%; border: 1px solid var(--glass-border); color: var(--text-primary); text-align: left; display: flex; justify-content: space-between;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                                    <span>🧠 View Problem Statement</span>
                                    <span>▼</span>
                                </button>
                                <div class="hidden" style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 0.5rem; font-size: 0.9rem;">
                                    <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${rec.problem_context?.problem_domain || 'Problem Domain'}</h4>
                                    <p style="color: var(--text-primary); margin-bottom: 0.5rem;">${rec.problem_context?.problem_statement || 'Solve a real world problem with AI.'}</p>
                                    <p style="color: var(--accent-color);"><em>Impact: ${rec.problem_context?.real_world_impact || 'Positive societal impact'}</em></p>
                                </div>
                            </div>
                        `;
                        resultsDiv.appendChild(card);
                    });
                } else {
                    resultsDiv.innerHTML = `<div class="result-card"><p>Error or no recommendations found.</p></div>`;
                }
            } catch (e) {
                resultsDiv.innerHTML = `<div class="result-card"><p>Failed to connect to API.</p></div>`;
            }

            loading.classList.add('hidden');
            resultsDiv.classList.remove('hidden');
            btnDiscover.disabled = false;
        });
    }

    // Solutions Logic
    const btnSolutions = document.getElementById('btn-solutions');
    if (btnSolutions) {
        btnSolutions.addEventListener('click', async () => {
            const theme = document.getElementById('solution-theme').value.trim();
            
            const loading = document.getElementById('solutions-loading');
            const resultsDiv = document.getElementById('solutions-results');
            
            loading.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
            resultsDiv.innerHTML = '';
            btnSolutions.disabled = true;

            try {
                const res = await fetch(`/api/solutions/${encodeURIComponent(theme)}`);
                const json = await res.json();
                
                if (json.success && json.data) {
                    json.data.forEach(sol => {
                        const card = document.createElement('div');
                        card.className = 'result-card glass';
                        card.innerHTML = `
                            <h3>${sol.title}</h3>
                            <p>${sol.description || 'No description provided.'}</p>
                            <div class="badges">
                                ${sol.technologies ? sol.technologies.slice(0, 5).map(t => `<span class="badge tech">${t}</span>`).join('') : ''}
                            </div>
                        `;
                        resultsDiv.appendChild(card);
                    });
                } else {
                    resultsDiv.innerHTML = `<div class="result-card"><p>No solutions found.</p></div>`;
                }
            } catch (e) {
                resultsDiv.innerHTML = `<div class="result-card"><p>Failed to connect to API.</p></div>`;
            }

            loading.classList.add('hidden');
            resultsDiv.classList.remove('hidden');
            btnSolutions.disabled = false;
        });
    }

    // Form Auto-fill Logic
    const btnForm = document.getElementById('btn-form');
    if (btnForm) {
        btnForm.addEventListener('click', async () => {
            const url = document.getElementById('form-url').value.trim();
            const project = document.getElementById('form-project').value.trim();
            
            const loading = document.getElementById('form-loading');
            const resultsDiv = document.getElementById('form-results');
            
            loading.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
            resultsDiv.innerHTML = '';
            btnForm.disabled = true;

            try {
                const res = await fetch('/api/forms/fill', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hackathon_url: url,
                        project_name: project,
                        project_description: "An innovative AI-powered approach to workflow automation.",
                        team_members: [{ name: "Alice", email: "alice@example.com" }],
                        technologies: ["React", "TypeScript", "Node.js"],
                        github_url: "https://github.com/example/repo",
                        demo_url: "https://demo.example.com"
                    })
                });
                const json = await res.json();
                
                const card = document.createElement('div');
                card.className = 'result-card glass';
                
                if (json.success) {
                    card.innerHTML = `
                        <h3>✅ Auto-Fill Request Complete</h3>
                        <p><strong>Fields Filled:</strong> ${json.data.form_fields_filled || 0}</p>
                        <p><strong>Status:</strong> ${json.data.status || 'Success'}</p>
                        <p><em>(Check agent logs or tinyfish recordings for the visual proof)</em></p>
                    `;
                } else {
                    card.innerHTML = `
                        <h3>❌ Form Automation Error</h3>
                        <p>Status: ${json.error || json.data?.status || 'Failed'}</p>
                    `;
                }
                resultsDiv.appendChild(card);
                
            } catch (e) {
                resultsDiv.innerHTML = `<div class="result-card"><p>Failed to connect to API.</p></div>`;
            }

            loading.classList.add('hidden');
            resultsDiv.classList.remove('hidden');
            btnForm.disabled = false;
        });
    }

});
