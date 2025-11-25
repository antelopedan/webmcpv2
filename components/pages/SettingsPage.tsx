
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
// FIX: Corrected import path for api
import { api, ProfileUpdatePayload, WorkspaceUpdatePayload, McpServerUpdatePayload, PrivacyUpdatePayload } from '../../api';
// FIX: Corrected import path for types
import type { User, UserProfile, ConnectedAccountsResponse, WorkspaceSettings, McpServerSettings, PrivacySettings, ConnectionTestResult, ConnectedAccount, SettingsOptionsResponse } from '../../types';
import { getSocialIcon } from '../utils/socialUtils';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { InfoIcon } from '../icons/settings';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> & { as?: 'input' | 'textarea' | 'select' }> = ({ as = 'input', ...props }) => {
    const className = "w-full mt-1 px-4 py-2 text-text-main bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200";
    if (as === 'textarea') return <textarea {...props} className={className} />;
    if (as === 'select') return <select {...props} className={className} />;
    return <input {...props} className={className} />;
};

const Accordion: React.FC<{ title: string; children: ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
                <h3 className="text-lg font-semibold text-text-main">{title}</h3>
                <ChevronDownIcon className={`w-6 h-6 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0">{children}</div>
            </div>
        </div>
    );
};

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
             <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse">
                <div className="h-6 w-1/3 bg-border rounded"></div>
            </div>
        ))}
    </div>
);

interface SettingsPageProps {
  user: User | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [accounts, setAccounts] = useState<ConnectedAccountsResponse | null>(null);
    const [workspace, setWorkspace] = useState<WorkspaceSettings | null>(null);
    const [mcpServer, setMcpServer] = useState<McpServerSettings | null>(null);
    const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
    const [options, setOptions] = useState<SettingsOptionsResponse | null>(null);
    const [mcpApiKey, setMcpApiKey] = useState('');
    const [competitorInput, setCompetitorInput] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<{[key: string]: 'idle' | 'saving' | 'saved'}>({});
    const [testConnectionResult, setTestConnectionResult] = useState<ConnectionTestResult | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profileRes, accountsRes, workspaceRes, mcpServerRes, privacyRes, optionsRes] = await Promise.all([
                api.get<UserProfile>('settings/profile'),
                api.get<ConnectedAccountsResponse>('settings/connected-accounts'),
                api.get<WorkspaceSettings>('settings/workspace'),
                api.get<McpServerSettings>('settings/mcp-server'),
                api.get<PrivacySettings>('settings/privacy'),
                api.get<SettingsOptionsResponse>('settings/options'),
            ]);

            if (user) {
                setProfile({ ...profileRes, first_name: user.first_name, last_name: user.last_name, email: user.email });
            } else {
                setProfile(profileRes);
            }

            setAccounts(accountsRes);
            setWorkspace(workspaceRes);
            setMcpServer(mcpServerRes);
            setPrivacy(privacyRes);
            setOptions(optionsRes);
        } catch (err: any) {
            setError(err.message || "Failed to load settings. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (section: string, payload: any) => {
        setSaveStatus(s => ({ ...s, [section]: 'saving' }));
        try {
            await api.put(`settings/${section}`, payload);
            setSaveStatus(s => ({ ...s, [section]: 'saved' }));
            setTimeout(() => setSaveStatus(s => ({ ...s, [section]: 'idle' })), 2000);
        } catch (err: any) {
            setError(`Failed to save ${section}: ${err.message}`);
            setSaveStatus(s => ({ ...s, [section]: 'idle' }));
        }
    };

    const handleAddCompetitor = () => {
        if (workspace && competitorInput && !workspace.competitors.includes(competitorInput)) {
            setWorkspace({ ...workspace, competitors: [...workspace.competitors, competitorInput] });
            setCompetitorInput('');
        }
    };

    const handleRemoveCompetitor = (competitorToRemove: string) => {
        if (workspace) {
            setWorkspace({ ...workspace, competitors: workspace.competitors.filter(c => c !== competitorToRemove) });
        }
    };
    
    const handleTestConnection = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsTesting(true);
        setTestConnectionResult(null);
        const button = e.currentTarget;
        button.classList.add('animate-pulse');
        
        try {
            const result = await api.post<ConnectionTestResult>('settings/mcp-server/test', {});
            setTestConnectionResult(result);
        } catch (err: any) {
            setTestConnectionResult({ success: false, message: err.message, response_time_ms: null });
        } finally {
            setIsTesting(false);
            setTimeout(() => button.classList.remove('animate-pulse'), 500);
        }
    };

    const handleAccountAction = async (platform: string, action: 'connect' | 'disconnect') => {
        try {
            if (action === 'connect') {
                // In a real app, this would trigger an OAuth flow and get a token.
                // For this simulation, we'll just send a dummy request.
                await api.post(`settings/connected-accounts/${platform}`, { access_token: "dummy_token", username: `@new_${platform}`});
            } else {
                await api.delete(`settings/connected-accounts/${platform}`);
            }
            // Refresh accounts list
            const accountsRes = await api.get<ConnectedAccountsResponse>('settings/connected-accounts');
            setAccounts(accountsRes);
        } catch (err: any) {
            setError(`Failed to ${action} account: ${err.message}`);
        }
    };

    if (isLoading) return <div className="container mx-auto"><SkeletonLoader /></div>;
    if (error) return <div className="container mx-auto p-4 bg-danger/20 text-danger rounded-lg">{error}</div>;

    return (
        <div className="container mx-auto fade-in space-y-8">
            <header>
                <h1 className="text-2xl md:text-3xl font-semibold text-text-main">Settings</h1>
                <p className="text-body text-text-secondary mt-2">Manage your account and application settings.</p>
            </header>

            <div className="space-y-6">
                <Accordion title="Profile Settings" defaultOpen>
                    {profile && options && (
                        <form onSubmit={(e) => { e.preventDefault(); handleSave('profile', { first_name: profile.first_name, last_name: profile.last_name, company: profile.company, role: profile.role } as ProfileUpdatePayload); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="text-body font-medium">First Name</label><FormInput type="text" value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} /></div>
                                <div><label className="text-body font-medium">Last Name</label><FormInput type="text" value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} /></div>
                                <div className="col-span-1 md:col-span-2"><label className="text-body font-medium">Email</label><FormInput type="email" value={profile.email} readOnly disabled className="bg-border/50 cursor-not-allowed" /></div>
                                <div><label className="text-body font-medium">Company</label><FormInput type="text" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} /></div>
                                <div><label className="text-body font-medium">Role</label><FormInput as="select" value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })}>
                                    {options.roles.map(role => (
                                        <option key={role.key} value={role.key}>{role.label}</option>
                                    ))}
                                </FormInput></div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button type="submit" disabled={saveStatus.profile === 'saving'} className="bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors w-28 text-center">
                                    {saveStatus.profile === 'saving' ? <LoadingSpinner /> : saveStatus.profile === 'saved' ? 'Saved!' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </Accordion>

                <Accordion title="Connected Accounts">
                    {accounts && (
                         <div className="space-y-4">
                            {accounts.connected.map((acc: ConnectedAccount) => (
                                <div key={acc.platform} className="flex justify-between items-center p-3 bg-background rounded-md">
                                    <div className="flex items-center gap-3">
                                        {getSocialIcon(acc.platform)}
                                        <span className="font-medium text-text-main capitalize">{acc.platform}</span>
                                        <span className="text-text-secondary">({acc.username})</span>
                                    </div>
                                    <button onClick={() => handleAccountAction(acc.platform, 'disconnect')} className="text-body text-danger font-semibold hover:underline">Disconnect</button>
                                </div>
                            ))}
                             {accounts.available.map(avail => (
                                <div key={avail.platform} className="flex justify-between items-center p-3 bg-background rounded-md opacity-60">
                                    <div className="flex items-center gap-3">
                                        {getSocialIcon(avail.platform)}
                                        <span className="font-medium capitalize">{avail.platform}</span>
                                    </div>
                                    <button onClick={() => handleAccountAction(avail.platform, 'connect')} className="text-body text-success font-semibold hover:underline">Connect</button>
                                </div>
                            ))}
                        </div>
                    )}
                </Accordion>
                
                <Accordion title="Workspace">
                     {workspace && options && (
                        <form onSubmit={(e) => { e.preventDefault(); handleSave('workspace', workspace as WorkspaceUpdatePayload); }}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="text-body font-medium">Brand Name</label><FormInput type="text" value={workspace.brand_name} onChange={e => setWorkspace({ ...workspace, brand_name: e.target.value })}/></div>
                                <div><label className="text-body font-medium">Industry</label><FormInput as="select" value={workspace.industry} onChange={e => setWorkspace({ ...workspace, industry: e.target.value })}>
                                    {options.industries.map(industry => (
                                        <option key={industry.key} value={industry.key}>{industry.label}</option>
                                    ))}
                                </FormInput></div>
                                <div className="md:col-span-2"><label className="text-body font-medium">Website URL</label><FormInput type="url" value={workspace.website_url} onChange={e => setWorkspace({ ...workspace, website_url: e.target.value })}/></div>
                                <div className="md:col-span-2">
                                    <label className="text-body font-medium">Competitors</label>
                                    <div className="flex gap-2 mt-1">
                                        <FormInput type="text" placeholder="Add a competitor" value={competitorInput} onChange={e => setCompetitorInput(e.target.value)} />
                                        <button type="button" onClick={handleAddCompetitor} className="bg-primary text-white font-semibold px-4 rounded-md">+</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {workspace.competitors.map(c => (
                                            <div key={c} className="bg-border text-text-main text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                                                <span>{c}</span>
                                                <button type="button" onClick={() => handleRemoveCompetitor(c)} className="text-text-secondary hover:text-danger">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button type="submit" disabled={saveStatus.workspace === 'saving'} className="bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors w-28 text-center">
                                     {saveStatus.workspace === 'saving' ? <LoadingSpinner /> : saveStatus.workspace === 'saved' ? 'Saved!' : 'Save'}
                                </button>
                            </div>
                        </form>
                     )}
                </Accordion>

                <Accordion title="MCP Server">
                    {mcpServer && (
                        <form onSubmit={(e) => { e.preventDefault(); handleSave('mcp-server', { server_url: mcpServer.server_url, api_key: mcpApiKey } as McpServerUpdatePayload); }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-body font-medium">Server URL</label>
                                    <FormInput type="url" value={mcpServer.server_url} onChange={e => setMcpServer({ ...mcpServer, server_url: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-body font-medium">API Key</label>
                                    <FormInput type="password" placeholder="Enter new key to update" value={mcpApiKey} onChange={e => setMcpApiKey(e.target.value)} />
                                    <p className="text-caption text-text-secondary mt-1">Current key: {mcpServer.api_key_masked}</p>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <button type="button" onClick={handleTestConnection} disabled={isTesting} className="bg-border text-text-main font-semibold px-4 py-2 rounded-md hover:bg-border/80 transition-colors">Test Connection</button>
                                    {testConnectionResult && (
                                        <div className={`flex items-center gap-2 text-sm font-medium ${testConnectionResult.success ? 'text-success' : 'text-danger'}`}>
                                            {testConnectionResult.success ? <CheckCircleIcon /> : <InfoIcon />}
                                            <span>{testConnectionResult.message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div className="mt-6 flex justify-end">
                                <button type="submit" disabled={saveStatus['mcp-server'] === 'saving'} className="bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors w-28 text-center">
                                    {saveStatus['mcp-server'] === 'saving' ? <LoadingSpinner /> : saveStatus['mcp-server'] === 'saved' ? 'Saved!' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </Accordion>

                <Accordion title="Data & Privacy">
                    {privacy && (
                         <form onSubmit={(e) => { e.preventDefault(); handleSave('privacy', privacy as PrivacyUpdatePayload); }}>
                             <div className="space-y-4">
                                <div>
                                    <label className="text-body font-medium">Historical Data Import (Days)</label>
                                    <FormInput as="select" value={privacy.historical_data_days} onChange={e => setPrivacy({ ...privacy, historical_data_days: parseInt(e.target.value) })}>
                                        <option value="30">30 Days</option>
                                        <option value="60">60 Days</option>
                                        <option value="90">90 Days</option>
                                    </FormInput>
                                </div>
                                <div>
                                    <label className="text-body font-medium">Data Refresh Frequency (Hours)</label>
                                    <FormInput as="select" value={privacy.refresh_frequency_hours} onChange={e => setPrivacy({ ...privacy, refresh_frequency_hours: parseInt(e.target.value) })}>
                                        <option value="12">Every 12 Hours</option>
                                        <option value="24">Every 24 Hours</option>
                                        <option value="48">Every 48 Hours</option>
                                    </FormInput>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button type="submit" disabled={saveStatus.privacy === 'saving'} className="bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors w-28 text-center">
                                     {saveStatus.privacy === 'saving' ? <LoadingSpinner /> : saveStatus.privacy === 'saved' ? 'Saved!' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </Accordion>
            </div>
        </div>
    );
};